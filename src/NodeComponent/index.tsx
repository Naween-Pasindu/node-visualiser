import { Component } from "solid-js";


interface NodeProps {
    id : string;
    x : number;
    y : number;
    numberInputs : number;
    numberOutputs : number;
    selected : boolean;
    onMouseDownNode : (id : string, event : any) => void;
    onMouseDownOutput : (outputPositionX : number, outputPositionY : number, nodeId : string, outputIndex : number) => void
}

const NodeComponent: Component<NodeProps> = (props : NodeProps) => {
    return <div></div>
}

export default NodeComponent;