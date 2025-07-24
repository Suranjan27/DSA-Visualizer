"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Search, Network, Brain, TreePine } from "lucide-react"
import SortingVisualizer from "@/components/sorting-visualizer"
import SearchVisualizer from "@/components/search-visualizer"
import GraphVisualizer from "@/components/graph-visualizer"
import TreeVisualizer from "@/components/tree-visualizer"

type VisualizerType = "sorting" | "searching" | "graph" | "tree" | null

export default function DSAVisualizer() {
  const [activeVisualizer, setActiveVisualizer] = useState<VisualizerType>(null)

  const visualizers = [
    {
      id: "sorting" as const,
      title: "Sorting Algorithms",
      description: "Visualize how different sorting algorithms work",
      icon: BarChart3,
      algorithms: ["Bubble Sort", "Selection Sort", "Insertion Sort", "Tree Sort"],
      color: "bg-blue-500",
    },
    {
      id: "searching" as const,
      title: "Search Algorithms",
      description: "See how search algorithms find elements",
      icon: Search,
      algorithms: ["Linear Search", "Binary Search"],
      color: "bg-green-500",
    },
    {
      id: "graph" as const,
      title: "Graph Algorithms",
      description: "Explore graph traversal algorithms",
      icon: Network,
      algorithms: ["BFS", "DFS"],
      color: "bg-purple-500",
    },
    {
      id: "tree" as const,
      title: "Tree Algorithms",
      description: "Visualize tree data structures and operations",
      icon: TreePine,
      algorithms: ["BST Insert", "Tree Traversals", "AVL Operations"],
      color: "bg-orange-500",
    },
  ]

  if (activeVisualizer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto p-4">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">DSA Visualizer</h1>
            </div>
            <Button variant="outline" onClick={() => setActiveVisualizer(null)}>
              ← Back to Menu
            </Button>
          </div>

          {activeVisualizer === "sorting" && <SortingVisualizer />}
          {activeVisualizer === "searching" && <SearchVisualizer />}
          {activeVisualizer === "graph" && <GraphVisualizer />}
          {activeVisualizer === "tree" && <TreeVisualizer />}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-12 w-12 text-blue-600" />
            <h1 className="text-5xl font-bold text-gray-800">DSA Visualizer</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Interactive visualizations of Data Structures and Algorithms to enhance your understanding through
            step-by-step animations and real-time demonstrations.
          </p>
        </div>

        {/* Visualizer Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {visualizers.map((visualizer) => {
            const Icon = visualizer.icon
            return (
              <Card
                key={visualizer.id}
                className="hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border-0 shadow-lg"
                onClick={() => setActiveVisualizer(visualizer.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={`w-16 h-16 ${visualizer.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-800">{visualizer.title}</CardTitle>
                  <CardDescription className="text-gray-600 text-base">{visualizer.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                      Available Algorithms:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {visualizer.algorithms.map((algorithm) => (
                        <Badge
                          key={algorithm}
                          variant="secondary"
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700"
                        >
                          {algorithm}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2">
                    Start Visualizing →
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
