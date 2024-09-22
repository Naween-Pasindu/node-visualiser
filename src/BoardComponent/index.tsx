import { Accessor, Component, createSignal, For, onMount, Setter } from "solid-js";

import styles from "./styles.module.css";
import ButtonComponent from "../ButtonsComponent";
import NodeComponent from "../NodeComponent";
import EdgeComponent from "../EdgeComponent";

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
    const [nodes, SetNodes] = createSignal<Node[]>([]);
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
        SetSelectedNode(null);
        SetSelectedEdge(null);
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
                const deltaX = event.x - clickedPosition().x;
                const deltaY = event.y - clickedPosition().y;
            
                const node = nodes().find((node) => node.id === selectedNode());
                if(node){
                    node.currPosition.set((_) => {
                        return {
                            x: (node.prevPosition.get().x + deltaX) / scale(),
                            y: (node.prevPosition.get().y + deltaY) / scale(),
                        };
                    });
                    for (let i = 0; i < node.inputEdgeIds.get().length; i++) {
                        const edgeId = node.inputEdgeIds.get()[i];
                        const edge = edges().find((edge) => edge.id === edgeId);
                        if (edge) {
                            edge.currEndPosition.set((_) => {
                                return {
                                    x: (edge.prevEndPosition.get().x + deltaX) / scale(),
                                    y: (edge.prevEndPosition.get().y + deltaY) / scale(),
                                };
                            });
                        }
                    }

                    for (let i = 0; i < node.outputEdgeIds.get().length; i++) {
                        const edgeId = node.outputEdgeIds.get()[i];
                        const edge = edges().find((edge) => edge.id === edgeId);
                        if (edge) {
                            edge.currStartPosition.set((_) => {
                                return {
                                    x: (edge.prevStartPosition.get().x + deltaX) / scale(),
                                    y: (edge.prevStartPosition.get().y + deltaY) / scale(),
                                };
                            });
                        }
                    }
                }
            }else{
                const deltaX = event.x - clickedPosition().x;
                const deltaY = event.y - clickedPosition().y;

                const boardWrapperElement = document.getElementById("boardWrapper");
                if (boardWrapperElement) {
                    boardWrapperElement.scrollBy(-deltaX, -deltaY);
                    SetClickedPosition({ x: event.x, y: event.y });
                }
            }
        }
        if (newEdge() !== null) {
            const boardWrapperElement = document.getElementById("boardWrapper");
            if (boardWrapperElement) {
                newEdge()?.currEndPosition.set({
                    x: (event.x + boardWrapperElement.scrollLeft) / scale(),
                    y: (event.y + +boardWrapperElement.scrollTop) / scale(),
                });
            }
        }
    }

    function handleOnClickAdd(numberInputs: number, numberOutputs: number){
        const randomX = Math.random() * window.innerWidth;
        const randomY = Math.random() * window.innerHeight;

        // Create signal
        const [nodePrev, setNodePrev] = createSignal<{ x: number; y: number }>({ x: randomX, y: randomY });
        const [nodeCurr, setNodeCurr] = createSignal<{ x: number; y: number }>({ x: randomX, y: randomY });
        const [inputsEdgesIds, setInputsEdgesIds] = createSignal<string[]>([]);
        const [outputsEdgesIds, setOutputsEdgesIds] = createSignal<string[]>([]);

        SetNodes([
            ...nodes(),
            {
                id: `node_${Math.random().toString(36).substring(2, 8)}`,
                numberInputs: numberInputs,
                numberOutputs: numberOutputs,
                prevPosition: { get: nodePrev, set: setNodePrev },
                currPosition: { get: nodeCurr, set: setNodeCurr },
                inputEdgeIds: { get: inputsEdgesIds, set: setInputsEdgesIds },
                outputEdgeIds: { get: outputsEdgesIds, set: setOutputsEdgesIds },
            },
        ]);
    }

    function handleOnClickDelete(){
        const node = nodes().find((node) => node.id === selectedNode());

        // Check if node exists
        if (!node) {
            SetSelectedNode(null);
            return;
        }

        // Delete node edges
        const inputs = node.inputEdgeIds.get();
        const outputs = node.outputEdgeIds.get();

        // Get all unique edges to delete
        const allEdges = [...inputs, ...outputs];
        const uniqueEdges = allEdges.filter((value, index, array) => {
            return array.indexOf(value) === index;
        });

        for (let i = 0; i < uniqueEdges.length; i++) {
            const edge = edges().find((edge) => edge.id === uniqueEdges[i]);
            if (edge) {
                const nodeStart = nodes().find((node) => node.id === edge.nodeStartId);
                const nodeEnd = nodes().find((node) => node.id === edge.nodeEndId);

                nodeStart?.outputEdgeIds.set([...nodeStart.outputEdgeIds.get().filter((edgeId) => edgeId !== uniqueEdges[i])]);
                nodeEnd?.inputEdgeIds.set([...nodeEnd.inputEdgeIds.get().filter((edgeId) => edgeId !== uniqueEdges[i])]);

                SetEdges([...edges().filter((e) => edge.id !== e.id)]);
            }
        }

        SetNodes([...nodes().filter((node) => node.id !== selectedNode())]);
        SetSelectedNode(null);
    }

    function handleOnMouseDownNode(id: string, event: any){
        SetSelectedEdge(null);
        SetSelectedNode(id);
        SetClickedPosition({ x: event.x, y: event.y });

        const node = nodes().find((node) => node.id === selectedNode());
        if (node) {
            node.prevPosition.set((_) => {
                return { x: node.currPosition.get().x * scale(), y: node.currPosition.get().y * scale() };
            });

            for (let i = 0; i < node.inputEdgeIds.get().length; i++) {
                const edgeId = node.inputEdgeIds.get()[i];
                const edge = edges().find((edge) => edge.id === edgeId);
                if (edge) {
                    edge.prevEndPosition.set((_) => {
                        return { x: edge.currEndPosition.get().x * scale(), y: edge.currEndPosition.get().y * scale() };
                    });
                }
            }

            for (let i = 0; i < node.outputEdgeIds.get().length; i++) {
                const edgeId = node.outputEdgeIds.get()[i];
                const edge = edges().find((edge) => edge.id === edgeId);
                if (edge) {
                    edge.prevStartPosition.set((_) => {
                        return { x: edge.currStartPosition.get().x * scale(), y: edge.currStartPosition.get().y * scale() };
                    });
                }
            }
        }
    }

    function handleOnMouseDownOutput(outputPositionX: number, outputPositionY: number, nodeId: string, outputIndex: number){
        SetSelectedNode(null);
        const boardWrapperElement = document.getElementById("boardWrapper");

        if (boardWrapperElement) {
            // Create edge position signals with updated scale value
            const [prevEdgeStart, setPrevEdgeStart] = createSignal<{ x: number; y: number }>({
                x: (outputPositionX + boardWrapperElement.scrollLeft) / scale(),
                y: (outputPositionY + boardWrapperElement.scrollTop) / scale(),
            });
            const [currEdgeStart, setCurrEdgeStart] = createSignal<{ x: number; y: number }>({
                x: (outputPositionX + boardWrapperElement.scrollLeft) / scale(),
                y: (outputPositionY + boardWrapperElement.scrollTop) / scale(),
            });
            const [prevEdgeEnd, setPrevEdgeEnd] = createSignal<{ x: number; y: number }>({
                x: (outputPositionX + boardWrapperElement.scrollLeft) / scale(),
                y: (outputPositionY + boardWrapperElement.scrollTop) / scale(),
            });
            const [currEdgeEnd, setCurrEdgeEnd] = createSignal<{ x: number; y: number }>({
                x: (outputPositionX + boardWrapperElement.scrollLeft) / scale(),
                y: (outputPositionY + boardWrapperElement.scrollTop) / scale(),
            });

            setNewEdge({
                id: "",
                nodeStartId: nodeId,
                outputIndex: outputIndex,
                nodeEndId: "",
                inputIndex: -1,
                prevStartPosition: { get: prevEdgeStart, set: setPrevEdgeStart },
                currStartPosition: { get: currEdgeStart, set: setCurrEdgeStart },
                prevEndPosition: { get: prevEdgeEnd, set: setPrevEdgeEnd },
                currEndPosition: { get: currEdgeEnd, set: setCurrEdgeEnd },
            });
        }
    }

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

    function handleOnDeleteEdge(edgeId: string) {
        const edge = edges().find((e) => e.id === edgeId);

        if (edge) {
            const nodeStart = nodes().find((n) => n.id === edge.nodeStartId);
            if (nodeStart) {
                nodeStart.outputEdgeIds.set([...nodeStart.outputEdgeIds.get().filter((edgeId) => edgeId !== edge.id)]);
            }

            const nodeEnd = nodes().find((n) => n.id === edge.nodeEndId);
            if (nodeEnd) {
                nodeEnd.inputEdgeIds.set([...nodeEnd.inputEdgeIds.get().filter((edgeId) => edgeId !== edge.id)]);
            }

            SetEdges([...edges().filter((e) => e.id !== edge.id)]);
        }
    }

    return <div id="boardWrapper" class={styles.wrapper}>
            <ButtonComponent showDelete={selectedNode() !== null} onClickAdd={handleOnClickAdd} onClickDelete={handleOnClickDelete} />
            <div
                id="board"
                class={grabbingBoard() ? styles.boardDragging : styles.board}
                onMouseDown={handleOnMouseDown}
                onMouseUp={handleOnMouseUp}
                onMouseMove={handleOnMouseMove}
            >
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
                {newEdge() !== null && (
                    <EdgeComponent
                        selected={false}
                        isNew={true}
                        position={{
                            x0: newEdge()!.currStartPosition.get().x,
                            y0: newEdge()!.currStartPosition.get().y,
                            x1: newEdge()!.currEndPosition.get().x,
                            y1: newEdge()!.currEndPosition.get().y,
                        }}
                        onMouseDownEdge={() => {}}
                        onClickDelete={() => {}}
                    />
                )}
                <For each={edges()}>
                    {(edge: Edge) => (
                        <EdgeComponent
                            selected={selectedEdge() === edge.id}
                            isNew={false}
                            position={{
                                x0: edge.currStartPosition.get().x,
                                y0: edge.currStartPosition.get().y,
                                x1: edge.currEndPosition.get().x,
                                y1: edge.currEndPosition.get().y,
                            }}
                            onMouseDownEdge={() => handleOnMouseDownEdge(edge.id)}
                            onClickDelete={() => handleOnDeleteEdge(edge.id)}
                        />
                    )}
                </For>
            </div>
    </div>;
}

export default BoardComponent;