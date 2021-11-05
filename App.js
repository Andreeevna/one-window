const generateJob = (id) =>
  function () {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let chance = Math.random();
        chance < 0.8 ? resolve() : reject();
      }, Math.random() * 2000);
    });
  };



const task = {
  id: "a1",
  priority: 10,
  job: () => {
    return new Promise((resolve, reject) => {
      if (true) {
        resolve();
      } else reject();
    })
  }
}

class Robot {
  constructor() {
    this.successCount = 0;
    this.failedCount = 0;
    this.tasks = [];
    this.timeSpent = 0;
    this.busy = false;
  }

  addTask(task) {
    this.tasks.push(task.id);
    this.busy = true;
    let startTime = Date.now();
    task.job()
      .then(function () { this.successCount++; }.bind(this))
      .catch(function () { this.failedCount++; }.bind(this))
      .finally(function () {
        this.busy = false;
        let endTime = Date.now();
        this.timeSpent += endTime - startTime;
      }.bind(this));
  }



  getReport() {
    return {
      successCount: this.successCount,
      failedCount: this.failedCount,
      tasks: this.tasks,
      timeSpent: this.timeSpent
    };
  }

}

class TaskManager {
  constructor(n) {
    this.robots = [];
    this.maxRobots = n;

    for (let i = 0; i < n; i++) {
      this.robots.push(new Robot());
    }

    this.tasks = [];
  }

  addToQueue(task) {
    this.tasks.push(task);
  }

  run = async () => {
    this.tasks = this.tasks.sort((a, b) => {
      if (a.priority > b.priority) {
        return 1;
      }
      if (a.priority < b.priority) {
        return -1;
      }
      return 0;
    });

    let giveTasks = () => {
      let task = this.tasks.pop();
      if (task == null || task == undefined) return;
      this.robots.forEach((robot) => {
        if (robot.busy) return;
        if (task == null || task == undefined) return;
        robot.addTask(task);
        task = null;
      });

      if (task !== null) {
        this.tasks.push(task);
      }
    }
    giveTasks = giveTasks.bind(this);

    let isDone = () => {
      let noTasks = this.tasks.length == 0;
      let tasksDone = true;
      this.robots.forEach(robot => {
        if (robot.busy) {
          tasksDone = false;
        }
      });
      return noTasks && tasksDone;
    }
    isDone = isDone.bind(this);

    let result = [];

    while (!isDone()) {
      giveTasks();
      await new Promise(r => setTimeout(r, 1));
    }

    this.robots.forEach(robot => {
      result.push(robot.getReport());
    });

    return result;
  }
}


function App() {
  const main = async () => {
    const tm = new TaskManager(3);

    tm.addToQueue({
      id: "id0",
      priority: 10,
      job: generateJob("id0")
    });

    tm.addToQueue({
      id: "id1",
      priority: 11,
      job: generateJob("id1")
    });

    tm.addToQueue({
      id: "id2",
      priority: 10,
      job: generateJob("id2")
    });

    tm.addToQueue({
      id: "id3",
      priority: 5,
      job: generateJob("id3")
    });

    const report = await tm.run();
    console.log(report);
  };

  main();

}

App();

