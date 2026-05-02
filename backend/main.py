from typing import Any, Literal

import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class CompleteBody(BaseModel):
    choice: str | None = None

TaskState = Literal["waiting", "triggered", "completed"]

class FlowTask(BaseModel):
    state: TaskState = "waiting"
    choice: str | None = None

# Fixed-state flow for hackathon story tasks.
_flow: dict[str, FlowTask] = {
    "task-1": FlowTask(),
    "task-2": FlowTask(),
    "task-3": FlowTask(),
}

def _reset_flow() -> None:
    for key in _flow:
        _flow[key] = FlowTask(state="waiting", choice=None)

def _get_flow_task(task_id: str) -> FlowTask:
    task = _flow.get(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail=f"unknown task id: {task_id}")
    return task

def _trigger(task_id: str) -> dict[str, Any]:
    task = _get_flow_task(task_id)
    if task.state == "waiting":
        task.state = "triggered"
        return {"ok": True, "changed": True, "task_id": task_id, "task": task.model_dump()}
    return {
        "ok": True,
        "changed": False,
        "task_id": task_id,
        "task": task.model_dump(),
        "reason": "already_triggered_or_completed",
    }

def _complete(task_id: str, choice: str | None = None) -> dict[str, Any]:
    task = _get_flow_task(task_id)
    if task.state != "triggered":
        return {
            "ok": False,
            "changed": False,
            "task_id": task_id,
            "task": task.model_dump(),
            "error": "task_not_triggered",
        }
    task.state = "completed"
    if choice is not None:
        task.choice = choice
    return {"ok": True, "changed": True, "task_id": task_id, "task": task.model_dump()}

_reset_flow()

@app.get("/health")
def health():
    return {"ok": True, "service": "husky-backend"}

@app.post("/flow/reset")
def flow_reset():
    _reset_flow()
    return {"ok": True, "message": "flow reset", "flow": {k: v.model_dump() for k, v in _flow.items()}}

@app.get("/flow")
def flow_state():
    return {"ok": True, "flow": {k: v.model_dump() for k, v in _flow.items()}}

@app.get("/task-1")
def task_1_status():
    return {"ok": True, "task_id": "task-1", "task": _get_flow_task("task-1").model_dump()}

@app.post("/task-1/trigger")
def task_1_trigger():
    return _trigger("task-1")

@app.post("/task-1/complete")
def task_1_complete():
    return _complete("task-1")

@app.get("/task-2")
def task_2_status():
    task = _get_flow_task("task-2")
    return {"ok": True, "task_id": "task-2", "task": task.model_dump(), "choice": task.choice}

@app.post("/task-2/trigger")
def task_2_trigger():
    return _trigger("task-2")

@app.post("/task-2/complete")
def task_2_complete(body: CompleteBody):
    return _complete("task-2", choice=body.choice)

@app.get("/task-2/choice")
def task_2_choice():
    task = _get_flow_task("task-2")
    if task.state != "completed":
        return {"ok": False, "choice": None, "reason": "task_not_completed"}
    return {"ok": True, "choice": task.choice}

@app.get("/task-3")
def task_3_status():
    return {"ok": True, "task_id": "task-3", "task": _get_flow_task("task-3").model_dump()}

@app.post("/task-3/trigger")
def task_3_trigger():
    return _trigger("task-3")

@app.post("/task-3/complete")
def task_3_complete():
    return _complete("task-3")

@app.get("/")
def root():
    return "Hello, from FastAPI!"

def main():
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    main()