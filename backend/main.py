"""VectorShift assessment — pipeline parsing service."""

from collections import defaultdict, deque
from typing import Any, Dict, List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Pipeline Parser")

# The React dev server runs on a different origin, so the browser
# preflights the POST. Without this, every submit fails at the network layer.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Node(BaseModel):
    id: str

    model_config = {"extra": "allow"}


class Edge(BaseModel):
    source: str
    target: str

    model_config = {"extra": "allow"}


class Pipeline(BaseModel):
    nodes: List[Node] = Field(default_factory=list)
    edges: List[Edge] = Field(default_factory=list)


class ParseResult(BaseModel):
    num_nodes: int
    num_edges: int
    is_dag: bool


def is_dag(nodes: List[Node], edges: List[Edge]) -> bool:
    """Kahn's algorithm. A graph is acyclic iff a topological order
    covers every node."""
    node_ids = {node.id for node in nodes}
    adjacency: Dict[str, List[str]] = defaultdict(list)
    in_degree: Dict[str, int] = {node_id: 0 for node_id in node_ids}

    for edge in edges:
        # Ignore edges that point at nodes we weren't sent.
        if edge.source not in node_ids or edge.target not in node_ids:
            continue
        adjacency[edge.source].append(edge.target)
        in_degree[edge.target] += 1

    queue = deque(node_id for node_id, degree in in_degree.items() if degree == 0)
    visited = 0

    while queue:
        current = queue.popleft()
        visited += 1
        for neighbour in adjacency[current]:
            in_degree[neighbour] -= 1
            if in_degree[neighbour] == 0:
                queue.append(neighbour)

    # Anything left unvisited is trapped in a cycle.
    return visited == len(node_ids)


@app.get("/")
def read_root() -> Dict[str, Any]:
    return {"Ping": "Pong"}


@app.post("/pipelines/parse", response_model=ParseResult)
def parse_pipeline(pipeline: Pipeline) -> ParseResult:
    return ParseResult(
        num_nodes=len(pipeline.nodes),
        num_edges=len(pipeline.edges),
        is_dag=is_dag(pipeline.nodes, pipeline.edges),
    )
