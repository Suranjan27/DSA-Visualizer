"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Shuffle } from "lucide-react"

interface ArrayElement {
  value: number
  state: "default" | "comparing" | "sorted" | "pivot" | "swapping" | "visited"
}

type SortingAlgorithm = "bubble" | "selection" | "insertion" | "tree"

export default function SortingVisualizer() {
  const [array, setArray] = useState<ArrayElement[]>([])
  const [arraySize, setArraySize] = useState(15)
  const [speed, setSpeed] = useState(50)
  const [algorithm, setAlgorithm] = useState<SortingAlgorithm>("bubble")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSorted, setIsSorted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const animationRef = useRef<number | null>(null)
  const isRunningRef = useRef(false)

  const algorithms = {
    bubble: "Bubble Sort",
    selection: "Selection Sort",
    insertion: "Insertion Sort",
    tree: "Tree Sort",
  }

  const generateRandomArray = useCallback(() => {
    const newArray: ArrayElement[] = []
    for (let i = 0; i < arraySize; i++) {
      newArray.push({
        value: Math.floor(Math.random() * 180) + 20,
        state: "default",
      })
    }
    setArray(newArray)
    setIsSorted(false)
    setCurrentStep(0)
  }, [arraySize])

  useEffect(() => {
    generateRandomArray()
  }, [generateRandomArray])

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const bubbleSort = async () => {
    const arr = [...array]
    const n = arr.length
    let steps = 0

    for (let i = 0; i < n - 1 && isRunningRef.current; i++) {
      for (let j = 0; j < n - i - 1 && isRunningRef.current; j++) {
        steps++
        setCurrentStep(steps)

        // Highlight comparing elements
        arr[j].state = "comparing"
        arr[j + 1].state = "comparing"
        setArray([...arr])

        await sleep(Math.max(50, 200 - speed * 2))

        if (arr[j].value > arr[j + 1].value) {
          // Swap elements
          const temp = arr[j]
          arr[j] = arr[j + 1]
          arr[j + 1] = temp

          steps++
          setCurrentStep(steps)

          // Show swapping
          arr[j].state = "swapping"
          arr[j + 1].state = "swapping"
          setArray([...arr])

          await sleep(Math.max(50, 200 - speed * 2))
        }

        // Reset states
        arr[j].state = "default"
        arr[j + 1].state = "default"
      }
      // Mark as sorted
      arr[n - 1 - i].state = "sorted"
      setArray([...arr])
    }

    if (isRunningRef.current) {
      arr[0].state = "sorted"
      setArray([...arr])
      setIsSorted(true)
    }

    setIsPlaying(false)
    isRunningRef.current = false
  }

  const selectionSort = async () => {
    const arr = [...array]
    const n = arr.length
    let steps = 0

    for (let i = 0; i < n - 1 && isRunningRef.current; i++) {
      let minIdx = i
      arr[i].state = "pivot"
      setArray([...arr])

      for (let j = i + 1; j < n && isRunningRef.current; j++) {
        steps++
        setCurrentStep(steps)

        arr[j].state = "comparing"
        setArray([...arr])
        await sleep(Math.max(50, 200 - speed * 2))

        if (arr[j].value < arr[minIdx].value) {
          if (minIdx !== i) arr[minIdx].state = "default"
          minIdx = j
          arr[minIdx].state = "pivot"
        } else {
          arr[j].state = "default"
        }
        setArray([...arr])
      }

      if (minIdx !== i) {
        steps++
        setCurrentStep(steps)

        // Swap
        const temp = arr[i]
        arr[i] = arr[minIdx]
        arr[minIdx] = temp

        arr[i].state = "swapping"
        arr[minIdx].state = "swapping"
        setArray([...arr])
        await sleep(Math.max(50, 200 - speed * 2))
      }

      arr[i].state = "sorted"
      setArray([...arr])
    }

    if (isRunningRef.current) {
      arr[n - 1].state = "sorted"
      setArray([...arr])
      setIsSorted(true)
    }

    setIsPlaying(false)
    isRunningRef.current = false
  }

  const insertionSort = async () => {
    const arr = [...array]
    const n = arr.length
    let steps = 0

    arr[0].state = "sorted"
    setArray([...arr])

    for (let i = 1; i < n && isRunningRef.current; i++) {
      const key = arr[i]
      key.state = "pivot"
      let j = i - 1

      setArray([...arr])
      await sleep(Math.max(50, 200 - speed * 2))

      while (j >= 0 && arr[j].value > key.value && isRunningRef.current) {
        steps++
        setCurrentStep(steps)

        arr[j].state = "comparing"
        arr[j + 1].state = "swapping"
        setArray([...arr])
        await sleep(Math.max(50, 200 - speed * 2))

        arr[j + 1] = { ...arr[j] }
        j--
      }

      arr[j + 1] = key
      arr[j + 1].state = "sorted"

      // Mark all elements up to i as sorted
      for (let k = 0; k <= i; k++) {
        arr[k].state = "sorted"
      }

      setArray([...arr])
    }

    if (isRunningRef.current) {
      setIsSorted(true)
    }

    setIsPlaying(false)
    isRunningRef.current = false
  }

  const treeSort = async () => {
    const arr = [...array]
    const n = arr.length
    let steps = 0

    // Build BST visualization
    const bstNodes: { value: number; inserted: boolean }[] = []

    // Insert phase
    for (let i = 0; i < n && isRunningRef.current; i++) {
      steps++
      setCurrentStep(steps)

      arr[i].state = "pivot"
      setArray([...arr])
      await sleep(Math.max(50, 200 - speed * 2))

      bstNodes.push({ value: arr[i].value, inserted: true })
      arr[i].state = "visited"
      setArray([...arr])
      await sleep(Math.max(50, 200 - speed * 2))
    }

    if (!isRunningRef.current) return

    // Sort the values (in-order traversal simulation)
    const sortedValues = bstNodes.map((node) => node.value).sort((a, b) => a - b)

    // Extract phase - place sorted values back
    for (let i = 0; i < n && isRunningRef.current; i++) {
      steps++
      setCurrentStep(steps)

      arr[i].value = sortedValues[i]
      arr[i].state = "swapping"
      setArray([...arr])
      await sleep(Math.max(50, 200 - speed * 2))

      arr[i].state = "sorted"
      setArray([...arr])
      await sleep(Math.max(50, 200 - speed * 2))
    }

    if (isRunningRef.current) {
      setIsSorted(true)
    }

    setIsPlaying(false)
    isRunningRef.current = false
  }

  const startSorting = () => {
    if (isSorted) return

    setIsPlaying(true)
    isRunningRef.current = true
    setCurrentStep(0)

    switch (algorithm) {
      case "bubble":
        bubbleSort()
        break
      case "selection":
        selectionSort()
        break
      case "insertion":
        insertionSort()
        break
      case "tree":
        treeSort()
        break
    }
  }

  const pauseSorting = () => {
    setIsPlaying(false)
    isRunningRef.current = false
  }

  const resetArray = () => {
    setIsPlaying(false)
    isRunningRef.current = false
    generateRandomArray()
  }

  const getBarColor = (state: ArrayElement["state"]) => {
    switch (state) {
      case "comparing":
        return "bg-red-500"
      case "swapping":
        return "bg-yellow-500"
      case "sorted":
        return "bg-green-500"
      case "pivot":
        return "bg-purple-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sorting Algorithm Visualizer</span>
            <Badge variant="outline" className="text-sm">
              {algorithms[algorithm]}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Algorithm</label>
              <Select value={algorithm} onValueChange={(value: SortingAlgorithm) => setAlgorithm(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bubble">Bubble Sort</SelectItem>
                  <SelectItem value="selection">Selection Sort</SelectItem>
                  <SelectItem value="insertion">Insertion Sort</SelectItem>
                  <SelectItem value="tree">Tree Sort</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Array Size: {arraySize}</label>
              <input
                type="range"
                min="8"
                max="25"
                value={arraySize}
                onChange={(e) => setArraySize(Number(e.target.value))}
                disabled={isPlaying}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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
              <div className="text-2xl font-bold text-blue-600 bg-blue-50 rounded-lg p-2 text-center">
                {currentStep}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <Button
              onClick={isPlaying ? pauseSorting : startSorting}
              disabled={isSorted && !isPlaying}
              className="flex items-center gap-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? "Pause" : "Start"}
            </Button>

            <Button
              onClick={resetArray}
              variant="outline"
              disabled={isPlaying}
              className="flex items-center gap-2 bg-transparent"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>

            <Button
              onClick={generateRandomArray}
              variant="outline"
              disabled={isPlaying}
              className="flex items-center gap-2 bg-transparent"
            >
              <Shuffle className="h-4 w-4" />
              Shuffle
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            Status: {isPlaying ? "Running..." : isSorted ? "Completed!" : "Ready to start"}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Default</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Comparing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Swapping</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span>Pivot/Key</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Sorted</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualization */}
      <Card>
        <CardContent className="pt-6">
          <div className="h-80 flex items-end justify-center gap-1 bg-gray-50 rounded-lg p-4 overflow-hidden">
            {array.map((element, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <div className="text-xs text-gray-600 font-medium h-4">{element.value}</div>
                <div
                  className={`${getBarColor(element.state)} transition-all duration-300 rounded-t-sm border border-gray-300`}
                  style={{
                    height: `${Math.max(element.value, 20)}px`,
                    width: `${Math.max(400 / arraySize - 2, 20)}px`,
                    minWidth: "20px",
                  }}
                  title={`Value: ${element.value}, Index: ${index}`}
                />
                <div className="text-xs text-gray-500 h-4">{index}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
