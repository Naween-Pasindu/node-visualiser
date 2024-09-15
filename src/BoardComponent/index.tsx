import { Accessor, Component, createSignal, For, onMount, Setter } from "solid-js";

import styles from "./styles.module.css";
import ButtonComponent from "../ButtonsComponent";
import NodeComponent from "../NodeComponent";

interface Node {
    id: string;
    numberInputs: number;
    numberOutputs: number;
    prevPosition: { get: Accessor<{ x: number; y: number }>; set: Setter<{ x: number; y: number }> };
    currPosition: { get: Accessor<{ x: number; y: number }>; set: Setter<{ x: number; y: number }> };
    inputEdgeIds: { get: Accessor<string[]>; set: Setter<string[]> };
    outputEdgeIds: { get: Accessor<string[]>; set: Setter<string[]> };
}

interface Edge {
    id: string;
    nodeStartId: string;
    nodeEndId: string;
    inputIndex: number;
    outputIndex: number;
    prevStartPosition: { get: Accessor<{ x: number; y: number }>; set: Setter<{ x: number; y: number }> };
    currStartPosition: { get: Accessor<{ x: number; y: number }>; set: Setter<{ x: number; y: number }> };
    prevEndPosition: { get: Accessor<{ x: number; y: number }>; set: Setter<{ x: number; y: number }> };
    currEndPosition: { get: Accessor<{ x: number; y: number }>; set: Setter<{ x: number; y: number }> };
}

const BoardComponent : Component = () => {
    const [grabbingBoard, SetGrabbingBoard] = createSignal<boolean>(false);
    const [scale, SetScale] = createSignal<number>(1);
    const [clickedPosition, SetClickedPosition] = createSignal<{x : number, y : number}>({x:1, y:1});
    const [selectedNode, SetSelectedNode] = createSignal<string | null>(null)
    const [newEdge, setNewEdge] = createSignal<Edge | null>(null);
    const [nodes, setNodes] = createSignal<Node[]>([]);
    const [insideInput, setInsideInput] = createSignal<{
        nodeId: string;
        inputIndex: number;
        positionX: number;
        positionY: number;
    } | null>(null);
    const [edges, SetEdges] = createSignal<Edge[]>([]);
    const [selectedEdge, SetSelectedEdge] = createSignal<string | null>(null);

    onMount(()=>{
        const boardElement = document.getElementById("board");
        if(boardElement){
            boardElement.addEventListener("wheel", (event) => {
                SetScale(scale() + event.deltaY * -0.005);
                SetScale(Math.min(Math.max(1, scale()), 2));
                boardElement.style.transform = `scale(${scale()})`;
                boardElement.style.marginTop = `${(scale() - 1) * 50}vh`;
                boardElement.style.marginLeft = `${(scale() - 1) * 50}vw`;
            }, { passive: false})
        }
    })

    function handleOnMouseDown(event : any){
        //console.log("mouse down")
        SetGrabbingBoard(true);
        SetClickedPosition({x: event.x, y: event.y});
    }
    function handleOnMouseUp(){
        //console.log("mouse up")
        SetGrabbingBoard(false);
        SetClickedPosition({x: -1, y: -1});
    }
    function handleOnMouseMove(event : any){
        //console.log("mouse move")
        if(clickedPosition().x >=0 && clickedPosition().y >=0){
            const deltaX = event.x - clickedPosition().x;
            const deltaY = event.y - clickedPosition().y;

            if(selectedNode() !== null){

            }else{
                const boardWrapper = document.getElementById("boardWrapper");
                if(boardWrapper){
                    boardWrapper.scrollBy(-deltaX, -deltaY);
                    SetClickedPosition({x: event.x, y: event.y});
                }
            }
        }
    }

    function handleOnClickAdd(numberInputs: number, numberOutputs: number){
        const randomX = Math.random() * window.innerWidth;
        const randomY = Math.random() * window.innerHeight;

        const [nodePrev, SetNodePrev] = createSignal<{ x: number; y: number }>({ x: randomX, y: randomY });
        const [nodeCurr, SetNodeCurr] = createSignal<{ x: number; y: number }>({ x: randomX, y: randomY });
        const [inputsEdgesIds, SetInputsEdgesIds] = createSignal<string[]>([]);
        const [outputsEdgesIds, SetOutputsEdgesIds] = createSignal<string[]>([]);
        
        setNodes([
                ...nodes(),
                 {
                    id: `node_${Math.random().toString(36).substring(2, 8)}`,
                    numberInputs: numberInputs,
                    numberOutputs: numberOutputs,
                    prevPosition: { get: nodePrev, set: SetNodePrev },
                    currPosition: { get: nodeCurr, set: SetNodeCurr },
                    inputEdgeIds: { get: inputsEdgesIds, set: SetInputsEdgesIds },
                    outputEdgeIds: { get: outputsEdgesIds, set: SetOutputsEdgesIds },
                },
        ]);
    }

    function handleOnClickDelete(){}

    function handleOnMouseDownNode(id: string, event: any){}

    function handleOnMouseDownOutput(outputPositionX: number, outputPositionY: number, nodeId: string, outputIndex: number){}

    function handleOnMouseEnterInput(inputPositionX: number, inputPositionY: number, nodeId: string, inputIndex: number) {
        setInsideInput({ nodeId, inputIndex, positionX: inputPositionX, positionY: inputPositionY });
    }

    function handleOnMouseLeaveInput(nodeId: string, inputIndex: number) {
        if (insideInput() !== null && insideInput()?.nodeId === nodeId && insideInput()?.inputIndex === inputIndex) setInsideInput(null);
    }

    function handleOnMouseDownEdge(edgeId: string) {
        SetSelectedNode(null);

        SetSelectedEdge(edgeId);
    }

    return <div id="boardWrapper" class={styles.wrapper}>
        <ButtonComponent showDelete={false} onClickAdd={handleOnClickAdd} onClickDelete={handleOnClickDelete}/>
        <div id="board" class={grabbingBoard() ? styles.boardDragging : styles.board}
        onMouseDown={handleOnMouseDown}
        onMouseUp={handleOnMouseUp}
        onMouseMove={handleOnMouseMove}
        >
        </div>
        <For each={nodes()}>
                    {(node: Node) => (
                        <NodeComponent
                            id={node.id}
                            x={node.currPosition.get().x}
                            y={node.currPosition.get().y}
                            numberInputs={node.numberInputs}
                            numberOutputs={node.numberOutputs}
                            selected={selectedNode() === node.id}
                            onMouseDownNode={handleOnMouseDownNode}
                            onMouseDownOutput={handleOnMouseDownOutput}
                            onMouseEnterInput={handleOnMouseEnterInput}
                            onMouseLeaveInput={handleOnMouseLeaveInput}
                        />
                    )}
                </For>
    </div>;
}

export default BoardComponent;