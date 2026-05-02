import uuid
from collections import deque
from typing import Any

import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Task(BaseModel):
    id: str
    handler: str
    args: dict[str, Any] = Field(default_factory=dict)

class TaskCreate(BaseModel):
    handler: str
    args: dict[str, Any] = Field(default_factory=dict)

class GetTaskResponse(BaseModel):
    task: Task | None

_queue: deque[Task] = deque()

def _seed_demo_queue() -> None:
    _queue.clear()
    for item in ("sword", "rocket", "orb", "sword", "rocket", "orb"):
        _queue.append(
            Task(
                id=str(uuid.uuid4()),
                handler="spawn",
                args={"item": item},
            )
        )
_seed_demo_queue()

@app.get("/test")
def test_endpoint():
    return "test endpoint works!"

@app.get("/get-task", response_model=GetTaskResponse)
def get_task():
    if not _queue:
        return GetTaskResponse(task=None)
    return GetTaskResponse(task=_queue.popleft())


@app.get("/peek-task", response_model=GetTaskResponse)
def peek_task():
    """Next task without removing it (safe for UI polling)."""
    if not _queue:
        return GetTaskResponse(task=None)
    return GetTaskResponse(task=_queue[0])

@app.post("/tasks")
def enqueue_tasks(tasks: list[TaskCreate]):
    ids: list[str] = []
    for t in tasks:
        task = Task(id=str(uuid.uuid4()), handler=t.handler, args=t.args)
        _queue.append(task)
        ids.append(task.id)
    return {"ok": True, "ids": ids}

@app.post("/tasks/reset-demo")
def reset_demo_queue():
    _seed_demo_queue()
    return {"ok": True, "queued": len(_queue)}

@app.get("/")
def root():
    return "Hello, from FastAPI!"

def main():
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    main()