(() => {
  const taskList = document.querySelector('#ct_list'),
    comTaskList = document.querySelector('#comt_list'),
    delTaskList = document.querySelector('#dt_list'),
    currentBadge = document.querySelector('.current_badge'),
    completedBadge = document.querySelector('.completed_badge'),
    deletedBadge = document.querySelector('.deleted_badge'),
    checkingBadge = (obj, badges) => {
      let { current, completed, del } = obj;
      badges.forEach((item, i) => {
        item.textContent =
          [current, completed, del][i].length < 10
            ? '0' + [current, completed, del][i].length
            : [current, completed, del][i].length;
      });
    };

  function isNotEmptyLocalStorage() {
    // Инициализация хранилища tasks в localStorage, если его там нет
    localStorage.tasks ??= JSON.stringify({
      current: [],
      completed: [],
      del: [],
    });
    const tasks = JSON.parse(localStorage.tasks);
    if (localStorage.tasks) {
      if (Array.isArray(tasks.current) && tasks.current.length > 0) {
        tasks.current.forEach((task) => {
          addNewTaskInTasksList({ task });
        });
      }
      if (Array.isArray(tasks.completed) && tasks.completed.length > 0) {
        tasks.completed.forEach((task) => {
          addTaskInDelOrComTasksList(task, '#comt_list');
        });
      }
      if (Array.isArray(tasks.del) && tasks.del.length > 0) {
        tasks.del.forEach((task) => {
          addTaskInDelOrComTasksList(task, '#dt_list');
        });
      }
      checkingBadge(tasks, [currentBadge, completedBadge, deletedBadge]);
    }
  }

  function deleteOrToggleAttContentEditable(elem, toggle = false) {
    if (!toggle) {
      if (elem.hasAttribute('contenteditable'))
        elem.removeAttribute('contenteditable');
    } else {
      if (elem.hasAttribute('contenteditable')) {
        elem.removeAttribute('contenteditable');
      } else {
        elem.setAttribute('contenteditable', '');
        elem.parentNode.setAttribute('data-value', elem.textContent);
        elem.focus();
      }
    }
  }
  function addNewTaskInTasksList(data) {
    const newTask = document.createElement('li');
    newTask.classList.add('task__li');
    newTask.setAttribute('data-value', data.task);
    newTask.setAttribute('data-id', taskList.querySelectorAll('li').length);
    newTask.innerHTML = `
      <p class="task__p">${data.task}</p>
      <div class="task__btns">
        <a class="btn-floating btn-small waves-effect waves-light blue" data-completed><i class="material-icons">star</i></a>
        <a class="btn-floating btn-small waves-effect waves-light green" data-edit><i class="material-icons">edit</i></a>
        <a class="btn-floating btn-small waves-effect waves-light red" data-delete><i class="material-icons">delete</i></a>
      </div>
      <div class="task__checkbox">    
        <label>
          <input type="checkbox" />
          <span>Edited</span>
        </label>
      </div>
    `;
    let taskP = newTask.querySelector('.task__p'),
      checkboxTask = newTask.querySelector('.task__checkbox'),
      btnsTask = newTask.querySelector('.task__btns');

    taskP.addEventListener('blur', (e) => {
      if (taskP.textContent === '') {
        let locTask = JSON.parse(localStorage.tasks);
        taskP.textContent = locTask.current[+newTask.getAttribute('data-id')];
      } else {
        newTask.setAttribute('data-value', taskP.textContent);
      }
      deleteOrToggleAttContentEditable(e.target, false);
      checkboxTask.style.display = 'none';
      btnsTask.style.display = 'flex';
    });
    taskP.addEventListener('dblclick', (e) => {
      deleteOrToggleAttContentEditable(e.target, true);
    });
    taskP.addEventListener('focus', (e) => {
      if (taskP.textContent !== '') {
        newTask.setAttribute('data-value', taskP.textContent);
      }
    });
    // console.log(taskList.querySelectorAll('li').length);
    taskList.append(newTask);
  }
  function addTaskInDelOrComTasksList(task, selector) {
    const parentElem = document.querySelector(selector),
      delTask = document.createElement('li');
    delTask.classList.add('task__li');
    delTask.style.cssText = 'display: flex; justify-content: space-between';
    delTask.setAttribute('data-value', task);
    delTask.innerHTML = `
      <p class="task__p">${task}</p>
      <div class="task__btns">
        <a class="btn-floating btn-small waves-effect waves-light blue" data-restore><i class="material-icons">restore</i></a>
        <a class="btn-floating btn-small waves-effect waves-light red" data-delete><i class="material-icons">delete</i></a>
      </div>
    `;
    let btnRestore = delTask.querySelector('[data-restore]');
    btnRestore.addEventListener('click', (event) => {
      let target = event.target.parentElement;
      if (target.getAttribute('data-restore') === '') {
        addNewTaskInTasksList({
          task: delTask.querySelector('.task__p').textContent,
        });
        delTask.parentNode.removeChild(delTask);
      }
    });
    parentElem.append(delTask);
  }

  taskList.addEventListener('click', (event) => {
    let target = event.target.parentElement;
    let elem = target.parentElement.parentElement,
      text = elem.querySelector('.task__p').textContent;
    if (target.getAttribute('data-delete') === '') {
      addTaskInDelOrComTasksList(text, '#dt_list');
      elem.parentNode.removeChild(elem);
    } else if (target.getAttribute('data-edit') === '') {
      let editElem = target.parentElement.parentElement.querySelector('p'),
        btnTask = elem.querySelector('.task__btns'),
        checkboxTask = elem.querySelector('.task__checkbox');
      btnTask.style.display = 'none';
      checkboxTask.style.display = 'flex';
      deleteOrToggleAttContentEditable(editElem, true);
    } else if (target.getAttribute('data-completed') === '') {
      addTaskInDelOrComTasksList(text, '#comt_list');
      elem.parentNode.removeChild(elem);
    }
  });

  function removeLi(event) {
    let target = event.target.parentElement;
    if (target.getAttribute('data-delete') === '') {
      let delElem = target.parentElement.parentElement;
      delElem.parentNode.removeChild(delElem);
    }
  }

  delTaskList.addEventListener('click', removeLi);

  comTaskList.addEventListener('click', (event) => {
    let target = event.target.parentElement;
    let elem = target.parentElement.parentElement,
      text = elem.querySelector('.task__p').textContent;
    addTaskInDelOrComTasksList(text, '#dt_list');
    removeLi(event);
  });

  let flag = '';
  let observerCurrentTasks = new MutationObserver((mutationRecords) => {
    const obj = JSON.parse(localStorage.tasks);
    mutationRecords.forEach((mutationRecord) => {
      if (mutationRecord.type === 'childList') {
        if (mutationRecord.addedNodes[0]?.classList?.contains('task__li')) {
          obj.current.push(
            mutationRecord.addedNodes[0].getAttribute('data-value')
          );
        } else if (mutationRecord.target?.classList.contains('blue')) {
          obj.completed.push(
            mutationRecord.target.parentElement.parentElement.getAttribute(
              'data-value'
            )
          );
          obj.current = obj.current.filter(
            (t) =>
              t !==
              mutationRecord.target.parentElement.parentElement.getAttribute(
                'data-value'
              )
          );
        } else if (mutationRecord.target?.classList.contains('red')) {
          obj.del.push(
            mutationRecord.target.parentElement.parentElement.getAttribute(
              'data-value'
            )
          );
          obj.current = obj.current.filter(
            (t) =>
              t !==
              mutationRecord.target.parentElement.parentElement.getAttribute(
                'data-value'
              )
          );
        }
      } else if (mutationRecord.type === 'characterData') {
        let taskNew = mutationRecord.target.data,
          taskOld = mutationRecord.oldValue;
        if (taskNew !== '') {
          obj.current[obj.current.indexOf(taskOld)] = taskNew;
        } else if (taskNew === '') {
          console.log(mutationRecord);
          flag = taskOld;
        }
        if (taskOld === '' && taskNew !== '') {
          obj.current[obj.current.indexOf(flag)] = taskNew;
        }
      }
      checkingBadge(obj, [currentBadge, completedBadge, deletedBadge]);
      localStorage.tasks = JSON.stringify(obj);
    });
  });

  let observerDeleteTasks = new MutationObserver((mutationRecords) => {
    mutationRecords.forEach((mutationRecord) => {
      if (
        mutationRecord.target?.classList.contains('blue') ||
        mutationRecord.target?.classList.contains('red')
      ) {
        let task =
          mutationRecord.target.parentElement.parentElement.getAttribute(
            'data-value'
          );
        const obj = JSON.parse(localStorage.tasks);
        obj.del = obj.del.filter((tas) => tas !== task);
        localStorage.tasks = JSON.stringify(obj);
        checkingBadge(obj, [currentBadge, completedBadge, deletedBadge]);
      }
    });
  });

  let observerCompletedTasks = new MutationObserver((mutationRecords) => {
    mutationRecords.forEach((mutationRecord) => {
      if (
        mutationRecord.addedNodes.length > 0 &&
        (mutationRecord.target.getAttribute('data-restore') === '' ||
          mutationRecord.target.getAttribute('data-delete') === '')
      ) {
        const obj = JSON.parse(localStorage.tasks);
        let task =
          mutationRecord.target.parentElement.parentElement.getAttribute(
            'data-value'
          );
        obj.completed = obj.completed.filter((tas) => tas !== task);
        if (mutationRecord.target?.classList.contains('red'))
          obj.del.push(task);
        localStorage.tasks = JSON.stringify(obj);
        checkingBadge(obj, [currentBadge, completedBadge, deletedBadge]);
      }
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    const headerTabs = document.querySelector('#tabs-swipe-demo'),
      form = document.querySelector('#formElem'),
      modalElem = document.querySelector('#modal1'),
      btnAdd = document.querySelector('.main__btn_add'),
      btnClearLocalStorage = document.querySelector('[data-clear]');
    let tabs = M.Tabs.init(document.querySelector('.tabs'), {}),
      modal = M.Modal.init(modalElem, {});
    tabs.select('current');
    form.classList.add('fade-in');

    isNotEmptyLocalStorage();

    observerCurrentTasks.observe(taskList, {
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: true,
    });
    observerDeleteTasks.observe(delTaskList, {
      childList: true,
      subtree: true,
    });
    observerCompletedTasks.observe(comTaskList, {
      childList: true,
      subtree: true,
    });

    document.addEventListener('keydown', (event) => {
      if (event.code === 'Enter' || event.code === 'NumpadEnter') {
        let currP = taskList.querySelectorAll('.task__p');
        currP.forEach((p) => deleteOrToggleAttContentEditable(p));
      }
    });

    headerTabs.addEventListener('click', (event) => {
      if (
        form.classList.contains('fade-out') &&
        event.target.getAttribute('href') === '#current'
      ) {
        form.classList.remove('fade-out');
        form.classList.add('fade-in');
      } else if (
        form.classList.contains('fade-in') &&
        (event.target.getAttribute('href') === '#completed' ||
          event.target.getAttribute('href') === '#deleted')
      ) {
        form.classList.remove('fade-in');
        form.classList.add('fade-out');
      }
    });
    btnAdd.addEventListener('click', (event) => {
      event.preventDefault();
      const formDataObj = {};
      new FormData(form).forEach((value, key) => (formDataObj[key] = value));
      if (
        formDataObj.task &&
        formDataObj.task !== '' &&
        isNaN(formDataObj.task.trim())
      ) {
        addNewTaskInTasksList(formDataObj);
        form.reset();
      } else if (formDataObj.task.trim() === '') {
        showModalContent('Вы ничего не ввели', modal);
      } else if (!isNaN(formDataObj.task)) {
        showModalContent('Вы ввели число', modal);
      }
    });

    // Очистка всего LocalStorage
    btnClearLocalStorage.addEventListener('click', (e) => {
      if (localStorage.length > 0) {
        const curLi = taskList.querySelectorAll('li'),
          comLi = comTaskList.querySelectorAll('li'),
          delLi = delTaskList.querySelectorAll('li');
        clearList(curLi);
        clearList(comLi);
        clearList(delLi);
        checkingBadge({ current: [], completed: [], del: [] }, [
          currentBadge,
          completedBadge,
          deletedBadge,
        ]);
        localStorage.clear();
        localStorage.tasks ??= JSON.stringify({
          current: [],
          completed: [],
          del: [],
        });
      }
    });

    function clearList(list) {
      list.forEach((li) => {
        li.remove();
      });
    }

    function showModalContent(message = '') {
      if (message !== '') {
        const modalContent = document.querySelector('.modal-content');
        modalContent.classList.add('hide');
        const newContent = document.createElement('div');
        newContent.classList.add('modal-content');
        newContent.innerHTML = `
        <h4 class="center">${message}</h4>
      `;
        modalElem.insertBefore(newContent, modalElem.firstChild);
        modal.open();

        setTimeout(() => {
          newContent.remove();
          modalContent.classList.remove('hide');
          modal.close();
        }, 3000);
      }
    }
  });
})();
