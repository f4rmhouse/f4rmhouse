import F4rmerType from "../types/F4rmerType";
import { v4 as uuidv4 } from 'uuid';

export const mockF4rmers: F4rmerType[] = [
    {
        uid: uuidv4(),
        title: "Weather Master",
        jobDescription: "Gets the weather anywhere in the world",
        toolbox: [],
        creator: "filip",
        created: "2024-11-05"
    },
    {
        uid: uuidv4(),
        title: "CodeGen",
        jobDescription: "Write beautiful websites with data stores",
        toolbox: [],
        creator: "Filip",
        created: "2024-11-05"
    },
    {
        uid: uuidv4(),
        title: "Copy writer",
        jobDescription: "Create good copy for you website",
        toolbox: [],
        creator: "Filip",
        created: "2024-11-05"
    }
]