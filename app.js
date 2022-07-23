document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("addBook");
  submitForm.addEventListener("submit", function (e) {
    e.preventDefault();
    makeAddBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

const books = [];
const RENDER_EVENT = "render-makeAddBook";

const btnSearch = document.getElementById("searchSubmit");
btnSearch.addEventListener("click", function (e) {
  e.preventDefault();
  const searchTitle = document.getElementById("searchBookTitle").value.toLowerCase();
  const elementBook = document.querySelectorAll(".detailBook > h3");

  for (const searchBook of elementBook) {
    if (searchTitle === searchBook.innerText.toLowerCase()) {
      const p = searchBook.parentElement;
      p.parentElement.style.display = "block";
    } else {
      const p = searchBook.parentElement;
      p.parentNode.style.display = "none";
    }
  }
});

function makeAddBook() {
  const formTitle = document.getElementById("inputTitle").value;
  const formAuthor = document.getElementById("inputAuthor").value;
  const formYear = document.getElementById("inputYear").value;
  const formCompleted = document.getElementById("inputCompleteBook").checked;

  const generateID = generateId();
  const addBookObject = generateAddBookObject(generateID, formTitle, formAuthor, formYear, formCompleted);
  books.push(addBookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateAddBookObject(id, title, author, year, isComplete) {
  return { id, title, author, year, isComplete };
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBooks = document.getElementById("incompleteBookshelfList");
  uncompletedBooks.innerHTML = "";

  const completedBooks = document.getElementById("completeBookshelfList");
  completedBooks.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeElementBook(bookItem);
    if (!bookItem.isComplete) {
      uncompletedBooks.append(bookElement);
    } else {
      completedBooks.append(bookElement);
    }
  }
});

function makeElementBook(addBookObject) {
  const image = document.createElement("img");
  image.setAttribute("src", "assets/bookcover.jpg");

  const coverBook = document.createElement("div");
  coverBook.classList.add("coverBook");
  coverBook.append(image);

  const textTitle = document.createElement("h3");
  textTitle.innerText = addBookObject.title;
  const textAuthors = document.createElement("p");
  textAuthors.innerText = addBookObject.author;
  const textYear = document.createElement("p");
  textYear.innerText = addBookObject.year;

  const detailBook = document.createElement("div");
  detailBook.classList.add("detailBook");
  detailBook.append(textTitle, textAuthors, textYear);

  const btnGreen = document.createElement("button");
  btnGreen.classList.add("btnGreen");
  btnGreen.innerText = "Selesai dibaca";

  const btnRed = document.createElement("button");
  btnRed.classList.add("btnRed");
  btnRed.innerText = "Hapus buku";

  const action = document.createElement("div");
  action.classList.add("action");
  action.append(btnGreen, btnRed);

  const ElementBookItem = document.createElement("div");
  ElementBookItem.classList.add("bookitem");
  ElementBookItem.append(coverBook, detailBook, action);
  ElementBookItem.setAttribute("id", `book-$addBookObject.id`);

  if (addBookObject.isComplete) {
    btnGreen.innerText = "Belum Selesai dibaca";
    btnGreen.addEventListener("click", function () {
      undoBookFromCompleted(addBookObject.id);
    });
    btnRed.addEventListener("click", function () {
      const modal = document.querySelector(".modal_bg");
      modal.classList.add("bg_active");

      const close = document.getElementById("modalClose");
      close.addEventListener("click", function () {
        modal.classList.remove("bg_active");
      });

      const sub = document.getElementById("modalConfirm");
      sub.addEventListener("submit", function () {
        deleteBook(addBookObject.id);
      });
    });
  } else {
    btnGreen.addEventListener("click", function () {
      addBookToCompleted(addBookObject.id);
    });
    btnRed.addEventListener("click", function () {
      const modal = document.querySelector(".modal_bg");
      modal.classList.add("bg_active");

      const close = document.getElementById("modalClose");
      close.addEventListener("click", function () {
        modal.classList.remove("bg_active");
      });

      const sub = document.getElementById("modalConfirm");
      sub.addEventListener("submit", function () {
        deleteBook(addBookObject.id);
      });
    });
  }

  function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;
    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function findBook(bookId) {
    for (const bookItem of books) {
      if (bookItem.id === bookId) {
        return bookItem;
      }
    }
    return null;
  }

  function deleteBook(bookId) {
    const bookTarget = findBookIndex(bookId);
    if (bookTarget === -1) return;
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function findBookIndex(bookId) {
    for (const index in books) {
      if (books[index].id === bookId) {
        return index;
      }
    }
    return -1;
  }
  return ElementBookItem;
}

const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_APPS";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser tidak mendukung Local Storage!");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const addBook of data) {
      books.push(addBook);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
