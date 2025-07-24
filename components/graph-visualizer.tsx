"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Shuffle } from "lucide-react"

interface Node {
  id: number
  x: number
  y: number
  state: "default" | "visiting" | "visited" | "current" | "start"
}

interface Edge {
  from: number
  to: number
}

type GraphAlgorithm = "bfs" | "dfs"

export default function GraphVisualizer() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [speed, setSpeed] = useState(50)
  const [algorithm, setAlgorithm] = useState<GraphAlgorithm>("bfs")
  const [isPlaying, setIsPlaying] = useState(false)
  const [startNode, setStartNode] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [visitOrder, setVisitOrder] = useState<number[]>([])
  const isRunningRef = useRef(false)

  const algorithms = {
    bfs: "Breadth-First Search",
    dfs: "Depth-First Search",
  }

  const generateGraph = useCallback(() => {
    // Create a simple 4x3 grid graph
    const newNodes: Node[] = []
    const newEdges: Edge[] = []
    const rows = 3
    const cols = 4

    // Create nodes
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const id = row * cols + col
        newNodes.push({
          id,
          x: 80 + col * 100,
          y: 60 + row * 80,
          state: id === startNode ? "start" : "default",
        })
      }
    }

    // Create edges (connect adjacent nodes)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const id = row * cols + col

        // Connect to right neighbor
        if (col < cols - 1) {
          newEdges.push({
            from: id,
            to: id + 1,
          })
        }

        // Connect to bottom neighbor
        if (row < rows - 1) {
          newEdges.push({
            from: id,
            to: id + cols,
          })
        }
      }
    }

    setNodes(newNodes)
    setEdges(newEdges)
    setCurrentStep(0)
    setVisitOrder([])
  }, [startNode])

  useEffect(() => {
    generateGraph()
  }, [generateGraph])

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const getAdjacencyList = () => {
    const adj: { [key: number]: number[] } = {}

    nodes.forEach((node) => {
      adj[node.id] = []
    })

    edges.forEach((edge) => {
      adj[edge.from].push(edge.to)
      adj[edge.to].push(edge.from)
    })

    return adj
  }

  const bfsTraversal = async () => {
    const adj = getAdjacencyList()
    const visited = new Set<number>()
    const queue = [startNode]
    const order: number[] = []
    let steps = 0

    visited.add(startNode)

    while (queue.length > 0 && isRunningRef.current) {
      const current = queue.shift()!
      steps++
      setCurrentStep(steps)
      order.push(current)
      setVisitOrder([...order])

      // Update node state
      const updatedNodes = nodes.map((node) => ({
        ...node,
        state:
          node.id === current
            ? "current"
            : node.id === startNode
              ? "start"
              : visited.has(node.id)
                ? "visited"
                : "default",
      }))
      setNodes(updatedNodes)

      await sleep(Math.max(100, 300 - speed * 2))

      // Add neighbors to queue
      for (const neighbor of adj[current]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push(neighbor)

          // Mark as visiting
          const visitingNodes = updatedNodes.map((node) => ({
            ...node,
            state:
              node.id === neighbor
                ? "visiting"
                : node.id === current
                  ? "visited"
                  : node.id === startNode
                    ? "start"
                    : visited.has(node.id)
                      ? "visited"
                      : "default",
          }))
          setNodes(visitingNodes)
        }
      }

      await sleep(Math.max(100, 300 - speed * 2))
    }

    setIsPlaying(false)
    isRunningRef.current = false
  }

  const dfsTraversal = async () => {
    const adj = getAdjacencyList()
    const visited = new Set<number>()
    const stack = [startNode]
    const order: number[] = []
    let steps = 0

    while (stack.length > 0 && isRunningRef.current) {
      const current = stack.pop()!

      if (visited.has(current)) continue

      visited.add(current)
      steps++
      setCurrentStep(steps)
      order.push(current)
      setVisitOrder([...order])

      // Update node state
      const updatedNodes = nodes.map((node) => ({
        ...node,
        state:
          node.id === current
            ? "current"
            : node.id === startNode
              ? "start"
              : visited.has(node.id)
                ? "visited"
                : "default",
      }))
      setNodes(updatedNodes)

      await sleep(Math.max(100, 300 - speed * 2))

      // Add neighbors to stack (in reverse order for consistent traversal)
      const neighbors = adj[current].slice().reverse()
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor)
        }
      }

      await sleep(Math.max(100, 300 - speed * 2))
    }

    setIsPlaying(false)
    isRunningRef.current = false
  }

  const startTraversal = () => {
    setIsPlaying(true)
    isRunningRef.current = true
    setCurrentStep(0)
    setVisitOrder([])

    // Reset node states
    const resetNodes = nodes.map((node) => ({
      ...node,
      state: node.id === startNode ? "start" : "default",
    }))
    setNodes(resetNodes)

    switch (algorithm) {
      case "bfs":
        bfsTraversal()
        break
      case "dfs":
        dfsTraversal()
        break
    }
  }

  const pauseTraversal = () => {
    setIsPlaying(false)
    isRunningRef.current = false
  }

  const resetGraph = () => {
    setIsPlaying(false)
    isRunningRef.current = false
    generateGraph()
  }

  const getNodeColor = (state: Node["state"]) => {
    switch (state) {
      case "start":
        return "fill-green-500 stroke-green-700"
      case "current":
        return "fill-yellow-500 stroke-yellow-700"
      case "visiting":
        return "fill-orange-500 stroke-orange-700"
      case "visited":
        return "fill-blue-500 stroke-blue-700"
      default:
        return "fill-gray-300 stroke-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Graph Algorithm Visualizer</span>
            <Badge variant="outline" className="text-sm">
              {algorithms[algorithm]}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Algorithm</label>
              <Select value={algorithm} onValueChange={(value: GraphAlgorithm) => setAlgorithm(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bfs">BFS</SelectItem>
                  <SelectItem value="dfs">DFS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Start Node</label>
              <Select value={startNode.toString()} onValueChange={(value) => setStartNode(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id.toString()}>
                      Node {node.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Speed: {speed}%</label>
              <input
                type="range"
                min="1"
                max="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Steps</label>
              <div className="text-2xl font-bold text-purple-600 bg-purple-50 rounded-lg p-2 text-center">
                {currentStep}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <Button onClick={isPlaying ? pauseTraversal : startTraversal} className="flex items-center gap-2">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? "Pause" : "Start"}
            </Button>

            <Button
              onClick={resetGraph}
              variant="outline"
              disabled={isPlaying}
              className="flex items-center gap-2 bg-transparent"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>

            <Button
              onClick={generateGraph}
              variant="outline"
              disabled={isPlaying}
              className="flex items-center gap-2 bg-transparent"
            >
              <Shuffle className="h-4 w-4" />
              New Graph
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            Status: {isPlaying ? "Running..." : visitOrder.length > 0 ? "Completed!" : "Ready to start"}
          </div>
        </CardContent>
      </Card>

      {/* Visit Order */}
      {visitOrder.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Visit Order:</h3>
              <div className="flex flex-wrap gap-2">
                {visitOrder.map((nodeId, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {nodeId}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 border border-gray-500 rounded-full"></div>
              <span>Unvisited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 border border-green-700 rounded-full"></div>
              <span>Start Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 border border-yellow-700 rounded-full"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 border border-orange-700 rounded-full"></div>
              <span>Visiting</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 border border-blue-700 rounded-full"></div>
              <span>Visited</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graph Visualization */}
      <Card>
        <CardContent className="pt-6">
          <div className="w-full h-80 border rounded-lg bg-white overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 480 280">
              {/* Render edges */}
              {edges.map((edge, index) => {
                const fromNode = nodes.find((n) => n.id === edge.from)
                const toNode = nodes.find((n) => n.id === edge.to)
                if (!fromNode || !toNode) return null

                return (
                  <line
                    key={index}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                )
              })}

              {/* Render nodes */}
              {nodes.map((node) => (
                <g key={node.id}>
                  <circle cx={node.x} cy={node.y} r="18" className={getNodeColor(node.state)} strokeWidth="3" />
                  <text x={node.x} y={node.y + 5} textAnchor="middle" className="text-sm font-bold fill-white">
                    {node.id}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
