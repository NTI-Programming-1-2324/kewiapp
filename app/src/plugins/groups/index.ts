import { Plugin } from "../../types/plugin";

import { GroupCommand } from "./commands/group";

export const Groups: Plugin = {
    config: {
        name: "Groups"
    },
    commands: [
        GroupCommand
    ],
    afterLoad: () => {
        console.log("Loaded Groups Plugin")
    }
}