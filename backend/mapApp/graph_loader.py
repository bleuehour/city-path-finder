import osmnx as ox
import networkx as nx

def load_graphs():
    G = ox.graph_from_point((51.515, -0.103), dist=4000, network_type='walk')
    G_simple = nx.DiGraph(G)
    return G, G_simple

G, G_simple = load_graphs()
