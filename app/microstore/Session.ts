import { 
    DynamoDBClient, 
    PutItemCommand,
    GetItemCommand,
    UpdateItemCommand,
    DeleteItemCommand,
    QueryCommand
  } from "@aws-sdk/client-dynamodb";
  import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

/**
 * F4SessionStorage allows callers to update sessions stored in a 
 * remote datastore. 
 * 
 * This makes it possible for f4rmers to remember the past and 
 * lets users use different devices to contact f4rmers.
 */
export class F4SessionStorage {
  private client: DynamoDBClient;
  private readonly tableName = "f4-session-storage";

  constructor(region: string = "eu-central-1") {
    this.client = new DynamoDBClient({ region, credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    } });
  }

  /**
   * Create a new session record
   */
  async create(uid: string, f4rmer: string, data: Record<string, any>): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: marshall({
        uid,
        f4rmer,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
      ConditionExpression: "attribute_not_exists(uid) AND attribute_not_exists(f4rmer)"
    };

    try {
      await this.client.send(new PutItemCommand(params));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create session: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Read a session record by primary key and sort key
   */
  async read(uid: string): Promise<Record<string, any> | null> {
    const params = {
      TableName: this.tableName,
      Key: marshall({
        uid,
      })
    };

    try {
      const { Item } = await this.client.send(new GetItemCommand(params));
      return Item ? unmarshall(Item) : null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to read session: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Read a session record by primary key and sort key
   */
  async readF4rmer(title: string): Promise<Record<string, any>[] | null> {

    const params = {
      TableName: "f4-f4rmers",
      IndexName: 'title-index', // Assuming you have a GSI on the title field
      KeyConditionExpression: '#title = :title',
      ExpressionAttributeNames: {
        '#title': 'title'
      },
      ExpressionAttributeValues: marshall({
          ':title': title
      })
    };

    try {
      const { Items } = await this.client.send(new QueryCommand(params));
      return Items ? Items.map(item => unmarshall(item)) : [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to read session: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Read a session record by primary key and sort key
   */
  async getSummary(uti: string): Promise<Record<string, any> | null> {
    const params = {
      TableName: "f4-ns",
      Key: marshall({
        uti,
      })
    };

    try {
      const { Item } = await this.client.send(new GetItemCommand(params));
      return Item ? unmarshall(Item) : null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to read session: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Update an existing session record
   */
  async update(
    uid: string, 
    updates: Record<string, any>
  ): Promise<Record<string, any>> {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(updates).forEach(([key, value], index) => {
      const attributeKey = `#key${index}`;
      const attributeValue = `:value${index}`;
      updateExpressions.push(`${attributeKey} = ${attributeValue}`);
      expressionAttributeNames[attributeKey] = key;
      expressionAttributeValues[attributeValue] = value;
    });

    // Add updatedAt timestamp
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const params = {
      TableName: this.tableName,
      Key: marshall({
        uid,
      }),
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
    };

    try {
      const { Attributes } = await this.client.send(new UpdateItemCommand(params));
      return Attributes ? unmarshall(Attributes) : {};
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update session: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Delete a session record
   */
  async delete(uid: string): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: marshall({
        uid,
      })
    };

    try {
      await this.client.send(new DeleteItemCommand(params));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete session: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Query sessions by uid
   */
  async queryByUid(uid: string): Promise<Record<string, any>[]> {
    const params = {
      TableName: this.tableName,
      KeyConditionExpression: '#uid = :uid',
      ExpressionAttributeNames: {
        '#uid': 'uid'
      },
      ExpressionAttributeValues: marshall({
        ':uid': uid
      })
    };

    try {
      const { Items } = await this.client.send(new QueryCommand(params));
      return Items ? Items.map(item => unmarshall(item)) : [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to query sessions: ${error.message}`);
      }
      throw error;
    }
  }
}