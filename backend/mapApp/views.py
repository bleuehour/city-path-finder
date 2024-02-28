from django.shortcuts import render
from django.http import JsonResponse
import osmnx as ox
import networkx as nx
from .graph_loader import G, G_simple
from collections import deque


def dfs(graph, start, goal):
    stack = deque([start])  
    paths = {start: [start]}  
    visited = set()

    while stack:
        current_node = stack.pop()
        if current_node == goal:
            return paths[current_node]  
        
        if current_node not in visited:
            visited.add(current_node)
            for neighbor in graph.neighbors(current_node):
                if neighbor not in visited:
                    stack.append(neighbor)
                    paths[neighbor] = paths[current_node] + [neighbor]

    return None 

def bfs(graph, start, goal):
    q = deque([start])  
    paths = {start: [start]}  
    visited = set()

    while q:
        current_node = q.popleft()
        if current_node == goal:
            return paths[current_node]  
        
        if current_node not in visited:
            visited.add(current_node)
            for neighbor in graph.neighbors(current_node):
                if neighbor not in visited:
                    q.append(neighbor)
                    paths[neighbor] = paths[current_node] + [neighbor]

    return None  



def dijkstra_path(graph, start, goal):
        try:
            path = nx.dijkstra_path(graph, start, goal, weight='length')
            return path
        except nx.NetworkXNoPath:
            return None
        

PATHFINDING_FUNCTIONS = {
    "bfs": bfs,
    "dfs": dfs,
    "dijkstra": dijkstra_path,
}

def getpath(request):
    try:
        X1, Y1 = float(request.GET.get('start_x')), float(request.GET.get('start_y'))
        X2, Y2 = float(request.GET.get('end_x')), float(request.GET.get('end_y'))
        pathing = request.GET.get("pathing")

        if pathing not in PATHFINDING_FUNCTIONS:
            return JsonResponse({"error": "Invalid pathing method specified"}, status=400)
    except TypeError:
        return JsonResponse({"error": "Invalid or missing coordinates"}, status=400)

    start_node = ox.distance.nearest_nodes(G, X1, Y1)
    end_node = ox.distance.nearest_nodes(G, X2, Y2)

    path_function = PATHFINDING_FUNCTIONS[pathing]
    path = path_function(G_simple, start_node, end_node)

    if path:
        coordinates = [(G.nodes[node]['y'], G.nodes[node]['x']) for node in path]
        total_distance = sum(G[u][v][0]['length'] for u, v in zip(path[:-1], path[1:]))
        return JsonResponse({"distance": total_distance, "coords": coordinates}, safe=False)
    else:
        return JsonResponse({"error": "No path found"}, status=404)