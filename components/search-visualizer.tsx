"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Pause, RotateCcw, Search, Shuffle } from "lucide-react"

interface ArrayElement {
  value: number
  state: "default" | "searching" | "found" | "notFound" | "visited"
}

type SearchAlgorithm = "linear" | "binary"

export default function SearchVisualizer() {
  const [array, setArray] = useState<ArrayElement[]>([])
  const [arraySize, setArraySize] = useState(15)
  const [speed, setSpeed] = useState(50)
  const [algorithm, setAlgorithm] = useState<SearchAlgorithm>("linear")
  const [target, setTarget] = useState(25)
  const [isPlaying, setIsPlaying] = useState(false)
  const [searchResult, setSearchResult] = useState<{ found: boolean; index: number; steps: number } | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const isRunningRef = useRef(false)

  const algorithms = {
    linear: "Linear Search",
    binary: "Binary Search",
  }

  const generateArray = useCallback(() => {
    const newArray: ArrayElement[] = []

    if (algorithm === "binary") {
      // Generate sorted array for binary search
      for (let i = 0; i < arraySize; i++) {
        newArray.push({
          value: (i + 1) * 5,
          state: "default",
        })
      }
    } else {
      // Generate random array for linear search
      const values = new Set<number>()
      while (values.size < arraySize) {
        values.add(Math.floor(Math.random() * 100) + 1)
      }
      Array.from(values).forEach((value) => {
        newArray.push({
          value,
          state: "default",
        })
      })
    }

    setArray(newArray)
    setSearchResult(null)
    setCurrentStep(0)
  }, [arraySize, algorithm])

  useEffect(() => {
    generateArray()
  }, [generateArray])

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const linearSearch = async () => {
    const arr = [...array]
    let steps = 0

    for (let i = 0; i < arr.length && isRunningRef.current; i++) {
      steps++
      setCurrentStep(steps)

      // Highlight current element being searched
      arr[i].state = "searching"
      setArray([...arr])
      await sleep(Math.max(100, 300 - speed * 2))

      if (arr[i].value === target) {
        // Found the target
        arr[i].state = "found"
        setArray([...arr])
        setSearchResult({ found: true, index: i, steps })
        setIsPlaying(false)
        isRunningRef.current = false
        return
      } else {
        // Mark as visited
        arr[i].state = "visited"
        setArray([...arr])
      }
    }

    // Target not found
    setSearchResult({ found: false, index: -1, steps })
    setIsPlaying(false)
    isRunningRef.current = false
  }

  const binarySearch = async () => {
    const arr = [...array]
    let left = 0
    let right = arr.length - 1
    let steps = 0

    while (left <= right && isRunningRef.current) {
      steps++
      setCurrentStep(steps)

      const mid = Math.floor((left + right) / 2)

      // Reset previous states
      arr.forEach((el) => {
        if (el.state !== "found") el.state = "default"
      })

      // Highlight the current search range
      for (let i = left; i <= right; i++) {
        if (i === mid) {
          arr[i].state = "searching"
        } else {
          arr[i].state = "visited"
        }
      }

      setArray([...arr])
      await sleep(Math.max(100, 400 - speed * 3))

      if (arr[mid].value === target) {
        // Found the target
        arr[mid].state = "found"
        setArray([...arr])
        setSearchResult({ found: true, index: mid, steps })
        setIsPlaying(false)
        isRunningRef.current = false
        return
      } else if (arr[mid].value < target) {
        // Search right half
        for (let i = left; i <= mid; i++) {
          arr[i].state = "notFound"
        }
        left = mid + 1
      } else {
        // Search left half
        for (let i = mid; i <= right; i++) {
          arr[i].state = "notFound"
        }
        right = mid - 1
      }

      setArray([...arr])
      await sleep(Math.max(100, 400 - speed * 3))
    }

    // Target not found
    setSearchResult({ found: false, index: -1, steps })
    setIsPlaying(false)
    isRunningRef.current = false
  }

  const startSearch = () => {
    if (!target) return

    setIsPlaying(true)
    isRunningRef.current = true
    setSearchResult(null)
    setCurrentStep(0)

    // Reset array states
    const resetArray = array.map((el) => ({ ...el, state: "default" as const }))
    setArray(resetArray)

    switch (algorithm) {
      case "linear":
        linearSearch()
        break
      case "binary":
        binarySearch()
        break
    }
  }

  const pauseSearch = () => {
    setIsPlaying(false)
    isRunningRef.current = false
  }

  const resetSearch = () => {
    setIsPlaying(false)
    isRunningRef.current = false
    generateArray()
    setSearchResult(null)
    setCurrentStep(0)
  }

  const getBarColor = (state: ArrayElement["state"]) => {
    switch (state) {
      case "searching":
        return "bg-yellow-500"
      case "found":
        return "bg-green-500"
      case "visited":
        return "bg-blue-300"
      case "notFound":
        return "bg-red-300"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Search Algorithm Visualizer</span>
            <Badge variant="outline" className="text-sm">
              {algorithms[algorithm]}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Algorithm</label>
              <Select value={algorithm} onValueChange={(value: SearchAlgorithm) => setAlgorithm(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear Search</SelectItem>
                  <SelectItem value="binary">Binary Search</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Value</label>
              <Input
                type="number"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                disabled={isPlaying}
                min="1"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Array Size: {arraySize}</label>
              <input
                type="range"
                min="8"
                max="20"
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
          </div>

          <div className="flex gap-2 mb-4">
            <Button
              onClick={isPlaying ? pauseSearch : startSearch}
              disabled={!target}
              className="flex items-center gap-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              {isPlaying ? "Pause" : "Search"}
            </Button>

            <Button
              onClick={resetSearch}
              variant="outline"
              disabled={isPlaying}
              className="flex items-center gap-2 bg-transparent"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>

            <Button
              onClick={generateArray}
              variant="outline"
              disabled={isPlaying}
              className="flex items-center gap-2 bg-transparent"
            >
              <Shuffle className="h-4 w-4" />
              New Array
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            Steps taken: {currentStep} | Status:{" "}
            {isPlaying ? "Searching..." : searchResult ? "Completed!" : "Ready to start"}
          </div>
        </CardContent>
      </Card>

      {/* Search Result */}
      {searchResult && (
        <Card>
          <CardContent className="pt-6">
            <div
              className={`p-4 rounded-lg ${searchResult.found ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
            >
              <div className="flex items-center gap-2">
                <Search className={`h-5 w-5 ${searchResult.found ? "text-green-600" : "text-red-600"}`} />
                <span className={`font-semibold ${searchResult.found ? "text-green-800" : "text-red-800"}`}>
                  {searchResult.found
                    ? `Target ${target} found at index ${searchResult.index}!`
                    : `Target ${target} not found in the array.`}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Search completed in {searchResult.steps} steps.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span>Default</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Currently Searching</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-300 rounded"></div>
              <span>Visited/In Range</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-300 rounded"></div>
              <span>Eliminated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Found</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualization */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="text-center text-sm text-gray-600">
              {algorithm === "binary" ? "Sorted Array (Required for Binary Search)" : "Random Array"}
            </div>
            <div className="h-60 flex items-end justify-center gap-2 bg-gray-50 rounded-lg p-4 overflow-x-auto">
              {array.map((element, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div className="text-xs text-gray-600 font-medium h-4">{element.value}</div>
                  <div
                    className={`${getBarColor(element.state)} transition-all duration-300 rounded-t-sm border border-gray-300 flex items-end justify-center text-white text-xs font-bold`}
                    style={{
                      height: `${Math.max(element.value * 1.5, 30)}px`,
                      width: `${Math.max(400 / arraySize, 25)}px`,
                      minWidth: "25px",
                    }}
                  >
                    <span className="mb-1">{index}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
