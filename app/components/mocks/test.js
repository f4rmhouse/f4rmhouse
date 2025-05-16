import https from "https"
import axios from "axios"

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const handler = async (event, context) => {
  let response = {
    status: 200,
    body: "Done",
    isBase64Encoded: false
  };
  const VERIFY_TOKEN = "my_token"; // [Facebook Developers -> WhatsApp -> Configuration -> Webhook -> Verify token]
  const WHATSAPP_TOKEN = "EAANRzS4xQ3wBOwn1w46rYZBbZASEanmZBicCduqVdPjH8oZAquZBX5ux794EYZAtzyLtTFuZBgq2OZBELBR35G9hNSnnZCfZCZBNeKV7CW186QBsueohSkMLyOmVepBLS4rhSuJXi4qi6xDtlZCSdLW3MU3ng6Je3L7qVFbZC2ZBm1rwiJUiJ8cU4Eyt6vasQ9R9Wm0ZBFougj1pE2kek5J8zi5GXsHCFfcHisZD"
  
    const path = event?.path;
    const method = event?.httpMethod;
    const params = event?.queryStringParameters;
    const body = event.body ? JSON.parse(event.body) : "";

    if (path === "/webhook") {
      if (method === "POST") {
        let body = JSON.parse(event.body)
        let entries = body.entry;
        for (let entry of entries) {
          for (let change of entry.changes) {
            if (change.value != null && change.value.messages != null) {
              console.log("Change received: " + JSON.stringify(change));
              console.log("Body received: " + JSON.stringify(change));
              let message_body = change.value.messages[0].text.body;

              let f4rmerResponse = await askF4rmer(message_body)
              let from = "46763265444";
              let reply_message = f4rmer_response;
              let phone_number_id = "490238570837378"
              let _r = await sendReply(phone_number_id, WHATSAPP_TOKEN, from, reply_message);
              const responseBody = "Done";
              response = {
                "statusCode": 200,
                "body": JSON.stringify(responseBody),
                "isBase64Encoded": false
              };
              return response
            }
          }
        }
      } 
  }
  return response = {
    status: 200,
    body: "Done",
    isBase64Encoded: false
  };
};

const askF4rmer = async (user_message) => {

  const messagesWithUserReply = [{ id: 1, content: user_message, role: "user" }];
  let response = await axios.post("https://f4rmhouse.com/api/llm", 
    {
      messages: messagesWithUserReply, 
      description: "Your job is to multiply numbers together",
      show_intermediate_steps: false
    }, 
    {
      adapter: 'fetch'
    })

  const data = response.data
  let f4rmerResponse = data.message[data.message.length-1].kwargs.content
  
  return f4rmerResponse
} 

const sendReply = (phone_number_id, whatsapp_token, to, reply_message) => {

  //let json = { "messaging_product": "whatsapp", "to": "46763265444", "type": "template", "template": { "name": "hello_world", "language": { "code": "en_US" } } }
  let json = {
    messaging_product: "whatsapp",
    to: to,
    text: { body: reply_message },
  };
  let data = JSON.stringify(json);
  let path = "/v21.0/"+phone_number_id+"/messages?access_token="+whatsapp_token;
  let options = {
    host: "graph.facebook.com",
    path: path,
    method: "POST",
    headers: { "Content-Type": "application/json" }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let str = "";
      res.on("data", (chunk) => {
        str += chunk;
      });
      res.on("end", () => {
      });
    });

    req.on('error', (err) => {
      reject(err);
    });
    req.write(data)
    req.end();
  });
}