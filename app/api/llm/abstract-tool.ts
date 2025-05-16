import { tool } from "@langchain/core/tools";

function toolFactory({
    title, description, execution, params}:
    {title:string, description: string, execution: (...ps: any) => any, params: any}) 
{

    return tool(
        execution,
        {
            name: title,
            description: description,
            schema: params,
        }
    );   
}
export default toolFactory 