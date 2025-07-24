"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Plus, Trash2 } from "lucide-react"
import { TreePine } from "lucide-react" // Import TreePine

interface TreeNode {
  value: number
  x: number
  y: number
  left: TreeNode | null
  right: TreeNode | null
  state: "default" | "inserting" | "searching" | "found" | "visiting" | "current"
  id: string
}

type TreeAlgorithm = "insert" | "search" | "inorder" | "preorder" | "postorder"

export default function TreeVisualizer() {
  const [root, setRoot] = useState<TreeNode | null>(null)
  const [speed, setSpeed] = useState(50)
  const [algorithm, setAlgorithm] = useState<TreeAlgorithm>("insert")
  const [inputValue, setInputValue] = useState(50)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [traversalOrder, setTraversalOrder] = useState<number[]>([])
  const [searchResult, setSearchResult] = useState<{ found: boolean; steps: number } | null>(null)
  const isRunningRef = useRef(false)

  const algorithms = {
    insert: "BST Insert",
    search: "BST Search",
    inorder: "In-order Traversal",
    preorder: "Pre-order Traversal",
    postorder: "Post-order Traversal",
  }

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const calculateNodePositions = (node: TreeNode | null, x: number, y: number, spacing: number): void => {
    if (!node) return

    node.x = x
    node.y = y

    if (node.left) {
      calculateNodePositions(node.left, x - spacing, y + 80, spacing / 2)
    }
    if (node.right) {
      calculateNodePositions(node.right, x + spacing, y + 80, spacing / 2)
    }
  }

  const insertNode = async (value: number) => {
    let steps = 0
    const newNode: TreeNode = {
      value,
      x: 0,
      y: 0,
      left: null,
      right: null,
      state: "inserting",
      id: `node-${Date.now()}-${Math.random()}`,
    }

    if (!root) {
      newNode.state = "default"
      setRoot(newNode)
      calculateNodePositions(newNode, 300, 50, 100)
      setCurrentStep(1)
      return
    }

    const insertRecursive = async (current: TreeNode): Promise<TreeNode> => {
      steps++
      setCurrentStep(steps)

      current.state = "current"
      setRoot({ ...root })
      await sleep(Math.max(100, 300 - speed * 2))

      if (value < current.value) {
        if (!current.left) {
          current.left = newNode
          newNode.state = "default"
          calculateNodePositions(root, 300, 50, 100)
          current.state = "default"
          setRoot({ ...root })
          return current
        } else {
          current.state = "visiting"
          current.left = await insertRecursive(current.left)
        }
      } else if (value > current.value) {
        if (!current.right) {
          current.right = newNode
          newNode.state = "default"
          calculateNodePositions(root, 300, 50, 100)
          current.state = "default"
          setRoot({ ...root })
          return current
        } else {
          current.state = "visiting"
          current.right = await insertRecursive(current.right)
        }
      }

      current.state = "default"
      return current
    }

    if (isRunningRef.current) {
      await insertRecursive(root)
      calculateNodePositions(root, 300, 50, 100)
      setRoot({ ...root })
    }

    setIsPlaying(false)
    isRunningRef.current = false
  }

  const searchNode = async (value: number) => {
    if (!root) {
      setSearchResult({ found: false, steps: 0 })
      return
    }

    let steps = 0
    let found = false

    const searchRecursive = async (current: TreeNode | null): Promise<boolean> => {
      if (!current || !isRunningRef.current) return false

      steps++
      setCurrentStep(steps)

      current.state = "searching"
      setRoot({ ...root })
      await sleep(Math.max(100, 400 - speed * 3))

      if (value === current.value) {
        current.state = "found"
        setRoot({ ...root })
        found = true
        return true
      }

      current.state = "visiting"
      setRoot({ ...root })

      if (value < current.value) {
        return await searchRecursive(current.left)
      } else {
        return await searchRecursive(current.right)
      }
    }

    await searchRecursive(root)
    setSearchResult({ found, steps })
    setIsPlaying(false)
    isRunningRef.current = false
  }

  const traverseTree = async (type: "inorder" | "preorder" | "postorder") => {
    if (!root) return

    const order: number[] = []
    let steps = 0

    const traverse = async (node: TreeNode | null): Promise<void> => {
      if (!node || !isRunningRef.current) return

      if (type === "preorder") {
        steps++
        setCurrentStep(steps)
        node.state = "current"
        order.push(node.value)
        setTraversalOrder([...order])
        setRoot({ ...root })
        await sleep(Math.max(100, 400 - speed * 3))
        node.state = "visiting"
      }

      if (node.left) {
        await traverse(node.left)
      }

      if (type === "inorder") {
        steps++
        setCurrentStep(steps)
        node.state = "current"
        order.push(node.value)
        setTraversalOrder([...order])
        setRoot({ ...root })
        await sleep(Math.max(100, 400 - speed * 3))
        node.state = "visiting"
      }

      if (node.right) {
        await traverse(node.right)
      }

      if (type === "postorder") {
        steps++
        setCurrentStep(steps)
        node.state = "current"
        order.push(node.value)
        setTraversalOrder([...order])
        setRoot({ ...root })
        await sleep(Math.max(100, 400 - speed * 3))
        node.state = "visiting"
      }
    }

    await traverse(root)
    setIsPlaying(false)
    isRunningRef.current = false
  }

  const startOperation = () => {
    setIsPlaying(true)
    isRunningRef.current = true
    setCurrentStep(0)
    setTraversalOrder([])
    setSearchResult(null)

    // Reset all node states
    const resetNodeStates = (node: TreeNode | null): void => {
      if (!node) return
      node.state = "default"
      resetNodeStates(node.left)
      resetNodeStates(node.right)
    }

    resetNodeStates(root)
    setRoot(root ? { ...root } : null)

    switch (algorithm) {
      case "insert":
        insertNode(inputValue)
        break
      case "search":
        searchNode(inputValue)
        break
      case "inorder":
        traverseTree("inorder")
        break
      case "preorder":
        traverseTree("preorder")
        break
      case "postorder":
        traverseTree("postorder")
        break
    }
  }

  const pauseOperation = () => {
    setIsPlaying(false)
    isRunningRef.current = false
  }

  const clearTree = () => {
    setIsPlaying(false)
    isRunningRef.current = false
    setRoot(null)
    setCurrentStep(0)
    setTraversalOrder([])
    setSearchResult(null)
  }

  const generateSampleTree = () => {
    clearTree()
    const values = [50, 30, 70, 20, 40, 60, 80]
    let newRoot: TreeNode | null = null

    const insertValue = (root: TreeNode | null, value: number): TreeNode => {
      if (!root) {
        return {
          value,
          x: 0,
          y: 0,
          left: null,
          right: null,
          state: "default",
          id: `node-${Date.now()}-${value}`,
        }
      }

      if (value < root.value) {
        root.left = insertValue(root.left, value)
      } else if (value > root.value) {
        root.right = insertValue(root.right, value)
      }

      return root
    }

    values.forEach((value) => {
      newRoot = insertValue(newRoot, value)
    })

    if (newRoot) {
      calculateNodePositions(newRoot, 300, 50, 100)
      setRoot(newRoot)
    }
  }

  const renderTree = (node: TreeNode | null): JSX.Element[] => {
    if (!node) return []

    const elements: JSX.Element[] = []

    // Render edges first
    if (node.left) {
      elements.push(
        <line
          key={`edge-${node.id}-left`}
          x1={node.x}
          y1={node.y}
          x2={node.left.x}
          y2={node.left.y}
          stroke="#e5e7eb"
          strokeWidth="2"
        />,
      )
      elements.push(...renderTree(node.left))
    }

    if (node.right) {
      elements.push(
        <line
          key={`edge-${node.id}-right`}
          x1={node.x}
          y1={node.y}
          x2={node.right.x}
          y2={node.right.y}
          stroke="#e5e7eb"
          strokeWidth="2"
        />,
      )
      elements.push(...renderTree(node.right))
    }

    // Render node
    const getNodeColor = (state: TreeNode["state"]) => {
      switch (state) {
        case "inserting":
          return "fill-yellow-500 stroke-yellow-700"
        case "searching":
          return "fill-blue-500 stroke-blue-700"
        case "found":
          return "fill-green-500 stroke-green-700"
        case "current":
          return "fill-red-500 stroke-red-700"
        case "visiting":
          return "fill-purple-300 stroke-purple-500"
        default:
          return "fill-gray-300 stroke-gray-500"
      }
    }

    elements.push(
      <g key={`node-${node.id}`}>
        <circle cx={node.x} cy={node.y} r="20" className={getNodeColor(node.state)} strokeWidth="3" />
        <text x={node.x} y={node.y + 5} textAnchor="middle" className="text-sm font-bold fill-black">
          {node.value}
        </text>
      </g>,
    )

    return elements
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tree Algorithm Visualizer</span>
            <Badge variant="outline" className="text-sm">
              {algorithms[algorithm]}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Algorithm</label>
              <Select value={algorithm} onValueChange={(value: TreeAlgorithm) => setAlgorithm(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insert">BST Insert</SelectItem>
                  <SelectItem value="search">BST Search</SelectItem>
                  <SelectItem value="inorder">In-order Traversal</SelectItem>
                  <SelectItem value="preorder">Pre-order Traversal</SelectItem>
                  <SelectItem value="postorder">Post-order Traversal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {algorithm === "insert" ? "Insert Value" : algorithm === "search" ? "Search Value" : "Value"}
              </label>
              <Input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(Number(e.target.value))}
                disabled={isPlaying || (algorithm !== "insert" && algorithm !== "search")}
                min="1"
                max="100"
              />
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
              <div className="text-2xl font-bold text-orange-600 bg-orange-50 rounded-lg p-2 text-center">
                {currentStep}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <Button
              onClick={isPlaying ? pauseOperation : startOperation}
              disabled={!root && algorithm !== "insert"}
              className="flex items-center gap-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? "Pause" : "Start"}
            </Button>

            <Button
              onClick={clearTree}
              variant="outline"
              disabled={isPlaying}
              className="flex items-center gap-2 bg-transparent"
            >
              <Trash2 className="h-4 w-4" />
              Clear Tree
            </Button>

            <Button
              onClick={generateSampleTree}
              variant="outline"
              disabled={isPlaying}
              className="flex items-center gap-2 bg-transparent"
            >
              <Plus className="h-4 w-4" />
              Sample Tree
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            Status: {isPlaying ? "Running..." : root ? "Ready" : "Empty tree - Insert nodes to begin"}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {searchResult && (
        <Card>
          <CardContent className="pt-6">
            <div
              className={`p-4 rounded-lg ${searchResult.found ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
            >
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${searchResult.found ? "text-green-800" : "text-red-800"}`}>
                  {searchResult.found
                    ? `Value ${inputValue} found in the tree!`
                    : `Value ${inputValue} not found in the tree.`}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Search completed in {searchResult.steps} steps.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Traversal Order */}
      {traversalOrder.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Traversal Order:</h3>
              <div className="flex flex-wrap gap-2">
                {traversalOrder.map((value, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {value}
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
              <span>Default</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 border border-yellow-700 rounded-full"></div>
              <span>Inserting</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 border border-blue-700 rounded-full"></div>
              <span>Searching</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 border border-red-700 rounded-full"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-300 border border-purple-500 rounded-full"></div>
              <span>Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 border border-green-700 rounded-full"></div>
              <span>Found</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tree Visualization */}
      <Card>
        <CardContent className="pt-6">
          <div className="w-full h-96 border rounded-lg bg-white overflow-hidden">
            {root ? (
              <svg width="100%" height="100%" viewBox="0 0 600 380">
                {renderTree(root)}
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <TreePine className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No tree to display</p>
                  <p className="text-sm">Insert nodes or generate a sample tree to begin</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
