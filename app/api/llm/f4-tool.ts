import toolFactory from "./abstract-tool";
import { z } from "zod";
import axios, { AxiosResponse } from "axios";

import {F4ToolParams, F4ToolExecuteParams} from "./agent.interfaces"

function createF4Tool({ endpoint, title, endpoint_description, tool_description }: F4ToolParams) {
    async function executeF4Tool({ data }: F4ToolExecuteParams) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 'https://api.f4rmhouse.com' : 'http://localhost:8000';
        let url = `${baseUrl}/products/run`
        let body = {uti: title, endpoint: endpoint, params: data}
        try {
            const response: AxiosResponse = await axios.post(
              url, body,
              {
                headers: {"X-Username": "fillatino@gmail.com"}
              }
            );
            return response.data.Message;
          } catch (error) {
            console.log("error: ", error)
            return "an error occured: " + String(error)
        }
    }

    let callSig = {
        title: title, 
        description: tool_description, 
        execution: executeF4Tool, 
        params: z.object({
          data: z.string().describe(endpoint_description)
        })
    }

    return toolFactory(callSig)
}

export default createF4Tool 