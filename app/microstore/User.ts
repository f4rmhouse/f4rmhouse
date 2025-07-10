import axios, { AxiosError, AxiosResponse } from 'axios';
import ReviewType from '../components/types/ReviewType';
import UsageType from '../components/types/UsageType';
import F4rmerType from '../components/types/F4rmerType';
import TokenType from '../components/types/TokenType';
import { TokenEncryption, EncryptionConfig } from '../lib/security/encryption';

/**
 * User is an abstraction of a general consumer of f4rmhouse products. A user can
 * create/talk to and edit f4rmers that they have created.
 */
class User {
  private baseUrl: string;
  private provider: string;
  private token: string;
  private username: string;

  constructor(username: string, provider: string, token: string, baseUrl?: string) {
    this.baseUrl = baseUrl || (process.env.NEXT_PUBLIC_APP_ENV=== 'production' ? 'https://api.f4rmhouse.com' : 'http://localhost:8000');
    this.provider = provider;
    this.token = token
    this.username = username
  }

  /**
   * isValidSession will check if the current session is valid 
   * (a session is connected to the User at instantiation so no parameter is needed)
   * @returns 
   */
  async isValidSession(): Promise<any> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/user/valid`,
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider}
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response?.status === 403) {
        return {Code: 403, Message: "Token not valid"}
      }
      
      // Handle other status codes if needed
      throw error;
    }
  }

  /**
   * invoice returns a URL to the PDF of the invoice for current month
   * @returns 
   */
  async invoice(): Promise<any> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/user/invoice/upcoming`,
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * usage returns usage data for the user for the current month. Each time a f4rmer uses a tool is updated this
   * usage data.
   * @returns 
   */
  async usage(): Promise<UsageType[]> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/user/usage?uid=${this.username}`,
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * createReview will create a review
   * @param review 
   * @returns 
   */
  async createReview(review: ReviewType): Promise<any> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/user/review/create`, review,
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * rateReview will rate a review
   * @param rid 
   * @param uid 
   * @returns 
   */
  async rateReview(rid: string, uid: string): Promise<any> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/user/review/rate`, {tid: rid, uid: uid},
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * deleteReview will delete a review
   * @param rid 
   * @param rating 
   * @param username 
   * @returns 
   */
  async deleteReview(rid: string, rating: string, username:string): Promise<any> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/user/review/delete`, {data: username},
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * updateReview will update a review
   * @param rid 
   * @param rating 
   * @param username 
   * @returns 
   */
  async updateReview(rid: string, rating: string, username:string): Promise<any> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/user/review/update`, {data: username},
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * updateReview will update a review
   * @param rid 
   * @param rating 
   * @param username 
   * @returns 
   */
  async doesUserExist(): Promise<any> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/user/exists?uid=${this.username}`,
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }
  /**
   * updateReview will update a review
   * @param rid 
   * @param rating 
   * @param username 
   * @returns 
   */
  async createUserRecord(): Promise<any> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/user/create/empty?uid=${this.username}`, {},
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  async deleteAnalyticsRecord(): Promise<any> {
    try {
      const response: AxiosResponse = await axios.delete(
        `${this.baseUrl}/user/delete/analytics?uid=${this.username}`,
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * getF4rmers will return an array of f4rmers created by the user that is the owner of the current session
   * @returns 
   */
  async getF4rmers(): Promise<F4rmerType[]> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/user/f4rmer/read`,
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * addTool will add a tool to a f4rmer
   * @param usr 
   * @param uid 
   * @param tid 
   * @returns 
   */
  async addTool(usr:string, uid:string, tid:string): Promise<F4rmerType[]> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/user/f4rmer/add/tool?username=${usr}&uid=${uid}&tid=${tid}`, {},
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * getF4rmer will get one (1) f4rmer by its uid
   * @param user 
   * @param uid 
   * @returns 
   */
  async getF4rmer(user: string, uid: string): Promise<F4rmerType> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/user/f4rmer/read_specific?username=${user}&uid=${uid}`,
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  async updateF4rmer(f4rmer:F4rmerType): Promise<F4rmerType> {
    try {
      const response: AxiosResponse = await axios.patch(
        `${this.baseUrl}/user/f4rmer/update`, f4rmer,
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * createF4rmer will create a new f4rmer
   * @param f4 
   * @returns 
   */
  async createF4rmer(f4:F4rmerType): Promise<any> {
    try {
      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/user/f4rmer/create`, f4,
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * deleteF4rmer delted a f4rmer
   * TODO: fix this function (use delete not update)
   * @returns 
   */
  async deleteF4rmer(creator: string, uid: string): Promise<any> {
    try {
      const response: AxiosResponse = await axios.delete(
        `${this.baseUrl}/user/f4rmer/delete?creator=${creator}&uid=${uid}`,
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  async anonymizeReviews(username: string): Promise<any> {
    try {
      const response: AxiosResponse = await axios.delete(
        `${this.baseUrl}/user/review/anonymize?username=${username}`,
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  async deleteInteractions(username: string): Promise<any> {
    try {
      const response: AxiosResponse = await axios.delete(
        `${this.baseUrl}/user/review/interactions/delete?username=${username}`,
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  async getToken(server: string): Promise<any> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseUrl}/user/get/token?server=${server}`,
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider}
        }
      );

      // Decrypt the response data if it's encrypted
      return await this.decryptTokenData(response.data.Token);
    } catch (error) {
      console.error('Error fetching or decrypting token:', error);
      throw error;
    }
  }

  async createToken(token: TokenType): Promise<any> {
    try {
      // Encrypt the token before sending it to the server
      const encryptedTokenData = await this.encryptTokenData(token);
      
      let encryptedToken = token;
      encryptedToken.token = encryptedTokenData.encryptedData;
      
      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/user/create/token`,
        encryptedToken,
        {
          headers: { 
            Authorization: `${this.token}`, 
            "X-Username": this.username, 
            "X-Provider": this.provider,
            "Content-Type": "application/json"
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating encrypted token:', error);
      throw error;
    }
  }
  /**
   * Utility method to encrypt token data for secure transmission
   * @param tokenData - The token data to encrypt
   * @returns Encrypted token data ready for transmission
   */
  private async encryptTokenData(tokenData: any): Promise<any> {
    try {
      // Pass username for secure key derivation
      const encryptionPassword = EncryptionConfig.getEncryptionPassword(this.username);
      const encryptedToken = await TokenEncryption.encryptToken(tokenData, this.token);
      
      return {
        encryptedData: encryptedToken,
        encrypted: true
      };
    } catch (error) {
      console.error('Failed to encrypt token data:', error);
      throw new Error('Token encryption failed');
    }
  }

  /**
   * Utility method to decrypt token data received from server
   * @param responseData - The response data that may contain encrypted tokens
   * @returns Decrypted token data or original data if not encrypted
   */
  private async decryptTokenData(responseData: any): Promise<any> {
    try {
      // Check if the response contains encrypted data
      if (responseData && responseData.encryptedData) {
        // Pass username for secure key derivation
        const encryptionPassword = EncryptionConfig.getEncryptionPassword(this.username);
        const decryptedToken = await TokenEncryption.decryptToken(
          responseData,
          this.token
        );

        return {
          ...responseData,
          token: decryptedToken,
          encrypted: false // Mark as decrypted for client use
        };
      }
      
      // Return as-is if not encrypted (backward compatibility)
      return responseData;
    } catch (error) {
      console.error('Failed to decrypt token data:', error);
      throw new Error('Token decryption failed');
    }
  }

  async deleteToken(server: string): Promise<any> {
    try {
      const response: AxiosResponse = await axios.delete(
        `${this.baseUrl}/user/delete/token?server=${server}`,
        {
          headers: { Authorization: `${this.token}`, "X-Username": this.username, "X-Provider": this.provider}
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }
}

export default User;