// import React from "react";
// import Tasks from "./Tasks";
// import { Paper, TextField, Checkbox, Button } from "@material-ui/core";
// import "./App.css"; // Update your CSS file accordingly

// class App extends Tasks {
//   state = { tasks: [], currentTask: "" };

//   render() {
//     const { tasks, currentTask } = this.state;
//     return (
//       <div className="app">
//         <header className="app-header">
//           <h1>My To-Do List</h1>
//         </header>
//         <div className="main-content">
//           <Paper elevation={3} className="todo-container">
//             <form onSubmit={this.handleSubmit} className="task-form">
//               <TextField
//                 variant="outlined"
//                 size="small"
//                 className="task-input"
//                 value={currentTask}
//                 required={true}
//                 onChange={this.handleChange}
//                 placeholder="Add New TO-DO"
//               />
//               <Button
//                 className="add-task-btn"
//                 color="primary"
//                 variant="outlined"
//                 type="submit"
//               >
//                 Add Task
//               </Button>
//             </form>
//             <div className="tasks-list">
//               {tasks.map((task) => (
//                 <Paper key={task._id} className="task-item">
//                   <Checkbox
//                     checked={task.completed}
//                     onClick={() => this.handleUpdate(task._id)}
//                     color="primary"
//                   />
//                   <div
//                     className={
//                       task.completed ? "task-text completed" : "task-text"
//                     }
//                   >
//                     {task.task}
//                   </div>
//                   <Button
//                     onClick={() => this.handleDelete(task._id)}
//                     color="secondary"
//                     className="delete-task-btn"
//                   >
//                     Delete
//                   </Button>
//                 </Paper>
//               ))}
//             </div>
//           </Paper>
//         </div>
//       </div>
//     );
//   }
// }

// export default App;

import React from "react";
import Tasks from "./Tasks";
import "./App.css";

class App extends Tasks {
  state = {
    tasks: [],
    currentTask: "",
  };

  render() {
    const { tasks, currentTask } = this.state;
    const activeTasks = tasks.filter((t) => !t.completed).length;
    const completedTasks = tasks.filter((t) => t.completed).length;

    return (
      <div className="app">
        <div className="background-layer"></div>
        <div className="overlay-layer"></div>

        <div className="app-container">
          {/* <header className="app-header">
            <h1>Task Manager</h1>
            <p>Stay organized, stay productive</p>
          </header> */}

          <div className="stats-container">
            <div className="stat-card stat-active">
              <div className="stat-info">
                <h3>Active Tasks</h3>
                <div className="stat-number">{activeTasks}</div>
              </div>
              <div className="stat-icon active-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
            </div>

            <div className="stat-card stat-completed">
              <div className="stat-info">
                <h3>Completed</h3>
                <div className="stat-number">{completedTasks}</div>
              </div>
              <div className="stat-icon completed-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
            </div>
          </div>

          <div className="todo-container">
            <form onSubmit={this.handleSubmit} className="task-form-wrapper">
              <input
                type="text"
                className="task-input"
                value={currentTask}
                onChange={this.handleChange}
                placeholder="What needs to be done?"
                required
              />
              <button className="add-task-btn" type="submit">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Task
              </button>
            </form>

            <div className="tasks-list">
              {tasks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <p>No tasks yet. Add one to get started!</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task._id} className="task-item">
                    <button
                      className="task-checkbox"
                      onClick={() => this.handleUpdate(task._id)}
                      type="button"
                    >
                      {task.completed ? (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      ) : (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      )}
                    </button>

                    <div className="task-content">
                      <div
                        className={
                          task.completed ? "task-text completed" : "task-text"
                        }
                      >
                        {task.task}
                      </div>
                      <div className="task-date">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect
                            x="3"
                            y="4"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {task.date}
                      </div>
                    </div>

                    <button
                      className="delete-task-btn"
                      onClick={() => this.handleDelete(task._id)}
                      type="button"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="app-footer">
            <p>
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"} total
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
