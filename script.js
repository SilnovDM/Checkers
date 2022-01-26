let checkersArray = []; //в этой переменной будет массив из 32 шашек
let turn = true; //если эта переменная true, то ходят белые, если false, то чёрные
let attackingFlag = false;
const letterArray = ["A", "B", "C", "D", "E", "F", "G", "H"];
const numberArray = ["1", "2", "3", "4", "5", "6", "7", "8"];
let board = document.querySelector(".board");
let blackBlocks;
let activeBlocks;

let diagonales = [
  ["A1", "B2", "C3", "D4", "E5", "F6", "G7", "H8"],
  ["G1", "F2", "E3", "D4", "C5", "B6", "A7"],
  ["H2", "G3", "F4", "E5", "D6", "C7", "B8"],
  ["C1", "B2", "A3"],
  ["C1", "D2", "E3", "F4", "G5", "H6"],
  ["H6", "G7", "F8"],
  ["A3", "B4", "C5", "D6", "E7", "F8"],
  ["A5", "B6", "C7", "D8"],
  ["H4", "G5", "F6", "E7", "D8"],
  ["E1", "D2", "C3", "B4", "A5"],
  ["E1", "F2", "G3", "H4"],
  ["A7", "B8"],
  ["G1", "H2"],
];
// GoldWay: A1, B2, C3, D4, E5, F6, G7, H8 //Так называемая «Большая дорога»
// DoubleWayG1A7: G1, F2, E3, D4, C5, B6, A7 //Двойники
// DoubleWayH2B8: H2, G3, F4, E5, D6, C7, B8
// TripleWayC1A3: C1, B2, A3 //Тройники
// TripleWayC1H6: C1, D2, E3, F4, G5, H6
// TripleWayH6F8: H6, G7, F8
// TripleWayA3F8: A3, B4, C5, D6, E7, F8
// UltraWayA5D8: A5, B6, C7, D8 //Косяки
// UltraWayH4D8: H4, G5, F6, E7, D8
// UltraWayE1A5: E1, D2, C3, B4, A5
// UltraWayE1H4: E1, F2, G3, H4

class Checker {
  constructor(coordinate) {
    this.name = coordinate;
    this.queen = false;
    this.active = false;
    this.color = 0;
    this.attacked = false;
    this.attacking = false;
  }
  //Метод, проверяющий, не становится ли шашка дамкой. Если занимает поля whiteQueens и blackQueens, то this.queen = true
  checkIfQueen() {
    let whiteQueens = ["B8", "D8", "F8", "H8"];
    let blackQueens = ["A1", "C1", "E1", "G1"];
    if (
      this.color == 1 &&
      !this.queen &&
      whiteQueens.lastIndexOf(this.name) !== -1
    ) {
      return (this.queen = true);
    }
    if (
      this.color == 2 &&
      !this.queen &&
      blackQueens.lastIndexOf(this.name) !== -1
    ) {
      return (this.queen = true);
    }
  }
}
//Отрисовка доски с присвоением клеткам (не шашкам) id (строка 50) через вспомогательный массив letterArray.
function drawCheckers() {
  let block;
  let flag = true;

  for (let i = 8; i > 0; i--) {
    for (let j = 0; j < 8; j++) {
      if (j == 0) flag = !flag;
      block = document.createElement("div");

      if (flag) {
        block.className = "block black";
        block.id = letterArray[j] + i;
      } else {
        block.className = "block white";
      }

      board.appendChild(block);
      flag = !flag;
    }
  }
  //Расстановка шашек на доске и создание массива объектов шашек с присвоением значений свойства color, где 1 - белая шашка, 2 - чёрная шашка, 0 - пустая клетка.
  blackBlocks = document.querySelectorAll(".black");
  for (let blackBlock of blackBlocks) {
    let checker = document.createElement("div");
    if (+blackBlock.id[1] <= 3) {
      checker.className = "checker white-checker";

      blackBlock.appendChild(checker);
    } else if (+blackBlock.id[1] >= 6) {
      checker.className = "checker black-checker";
      blackBlock.appendChild(checker);
    } else {
      blackBlock.appendChild(checker);
      checker.className = "";
    }
    let NewChecker = new Checker(blackBlock.id);
    if (checker.classList.contains("white-checker")) {
      NewChecker.color = 1;
    } else if (checker.classList.contains("black-checker")) {
      NewChecker.color = 2;
    } else {
      NewChecker.color = 0;
    }
    checkersArray.push(NewChecker);
  }
}

//Отрисовка полей букв и цифр
function drawSquareTitles() {
  let horizontalTitle = document.querySelectorAll(".square-titles-horizontal");
  let verticalTitle = document.querySelectorAll(".square-titles-vertical");
  for (let letter of horizontalTitle) {
    for (i = 0; i < 8; i++) {
      let createLetter = document.createElement("div");
      createLetter.className = "square-letter";
      createLetter.textContent = letterArray[i];
      letter.appendChild(createLetter);
    }
  }
  for (let number of verticalTitle) {
    for (i = 1; i <= 8; i++) {
      let createNumber = document.createElement("div");
      createNumber.className = "square-number";
      createNumber.textContent = i;
      number.appendChild(createNumber);
    }
  }
}

drawCheckers();
drawSquareTitles();
moveTransition(true);
addEventToBoard();

function clearArrayOfSquares(squaresArray) {
  let i = 0;
  while (i < squaresArray.length) {
    if (squaresArray[i].length > 2 || Number.isNaN(squaresArray[i])) {
      squaresArray.splice(i, 1);
      // console.log(squaresArray[i]);
    } else {
      ++i;
    }
  }
  return squaresArray;
}

function getMaxOfArray(numberArray) {
  return Math.max.apply(null, numberArray);
}
//Удаление возможных полей для хода, которые для дамки блокируют шашки одного с ней цвета
function deleteSameColorBlockedSquares(array, checkerFromCheckerArray) {
  for (let i = 0; i < array.length; i++) {
    let auxiliaryArray = [];
    let deleteBorder = null;
    //сначала исключаем для хода клетки, заблокированные шашками одного с дамкой цвета
    for (let j = 0; j < array[i].length; j++) {
      let checkedSquare = checkersArray.find((o) => o.name == array[i][j]);
      if (checkerFromCheckerArray.color == checkedSquare.color) {
        auxiliaryArray.push(checkedSquare.name);
      }
    }
    if (auxiliaryArray.length == 1) continue;
    let checkerIndex = auxiliaryArray.indexOf(checkerFromCheckerArray.name);
    if (checkerIndex == 0) {
      deleteBorder = array[i].indexOf(auxiliaryArray[checkerIndex + 1]);
      array[i].splice(deleteBorder, array[i].length - deleteBorder);
    } else if (checkerIndex == auxiliaryArray.length - 1) {
      deleteBorder = array[i].indexOf(auxiliaryArray[checkerIndex - 1]);
      array[i].splice(0, deleteBorder + 1);
    } else {
      deleteBorder = [
        array[i].indexOf(auxiliaryArray[checkerIndex + 1]),
        array[i].indexOf(auxiliaryArray[checkerIndex - 1]),
      ];
      array[i].splice(deleteBorder[0], array[i].length - deleteBorder[0]);
      array[i].splice(0, deleteBorder[1] + 1);
    }
    return array;
  }
}
//исключаем для хода клетки, заблокированные двумя и более шашками противоположного цвета, стоящими в ряд
function deleteOppositeColorBlockedSquares(array, checkerFromCheckerArray) {
  console.log("функция очистки от блока вызвана");
  for (let i = 0; i < array.length; i++) {
    console.log("исходный массив", array);
    auxiliaryArray = [];
    let subArrayDown = [];
    let subArrayUp = [];
    for (let j = 0; j < array[i].length; j++) {
      let checkedSquare = checkersArray.find((o) => o.name == array[i][j]);
      if (
        checkerFromCheckerArray.color != checkedSquare.color &&
        checkedSquare.color != 0
      ) {
        auxiliaryArray.push(checkedSquare.name);
      }
    }
    if (auxiliaryArray.length <= 1) continue;
    console.log("вспомогательный массив", auxiliaryArray);
    for (let j = 0; j < auxiliaryArray[i].length; j++) {
      if (auxiliaryArray[j][1] < checkerFromCheckerArray.name[1]) {
        subArrayDown.push(auxiliaryArray[j]);
      } else {
        subArrayUp.push(auxiliaryArray[j]);
      }
    }
    console.log("массив вниз", subArrayDown);
    console.log("масссив вверх", subArrayUp);
    let lastElementIndex = array[i].indexOf(
      subArrayDown[subArrayDown.length - 1]
    );
    let firstElementIndex = array[i].indexOf(subArrayUp[0]);
    console.log("последний элемент массива", lastElementIndex);
    console.log("первый элемент массива", firstElementIndex);
    if (
      subArrayDown.length != 0 &&
      subArrayDown[subArrayDown.length - 1][1] -
        subArrayDown[subArrayDown.length - 2][1] ==
        1
    ) {
      array[i].splice(0, lastElementIndex + 1);
    }
    if (subArrayUp.length != 0 && subArrayUp[1][1] - subArrayUp[0][1] == 1) {
      array[i].splice(firstElementIndex, array[i].length - firstElementIndex);
    }
  }
  return array;
}
// checkerIndex = array.indexOf(checkerFromCheckerArray.name);
// array[i].splice(checkerIndex, 1);

function checkSquaresIfQueen(array, checkerFromCheckerArray) {
  array = array.filter((item) => item.includes(checkerFromCheckerArray.name));
  array = deleteSameColorBlockedSquares(array, checkerFromCheckerArray);
  array = deleteOppositeColorBlockedSquares(array, checkerFromCheckerArray);
  // let indexOfChecker = array.indexOf(checkerFromCheckerArray.name);
  // array.splice(indexOfChecker, 1);
  return array;
}

//Проверку клеток вынес в отдельную функцию, которую вызываем в более сложных
function checkSquares(checkerFromCheckerArray) {
  let indexLetter = letterArray.indexOf(checkerFromCheckerArray.name[0]);
  let indexNumber = numberArray.indexOf(checkerFromCheckerArray.name[1]);
  let squaresForCheck = [];
  // console.log(indexLetter);
  // console.log(indexNumber);
  //Составляем массив из четырёх клеток по диагонали
  // if (checkerFromCheckerArray.queen == false) {
  squaresForCheck = [
    letterArray[indexLetter + 1] + numberArray[indexNumber + 1],
    letterArray[indexLetter - 1] + numberArray[indexNumber + 1],
    letterArray[indexLetter - 1] + numberArray[indexNumber - 1],
    letterArray[indexLetter + 1] + numberArray[indexNumber - 1],
  ];
  squaresForCheck = clearArrayOfSquares(squaresForCheck);
  // } else {
  //   squaresForCheck = checkSquaresIfQueen(diagonales, checkerFromCheckerArray);
  // }
  // console.log(checkedSquares);
  //Удаление стрёмных элементов массива checkedSquares навроде 'Cundefined' и NaN, чтобы потом когда-либо не проводить проверок на них;
  return squaresForCheck;
}

//Показ хода дамки

function showQueenMoves(queenCheckerDiv) {
  for (let blackBlock of blackBlocks) {
    blackBlock.classList.remove("active-block");
  }
  let currentQueen = checkersArray.find(
    (o) => o.name === queenCheckerDiv.parentElement.id
  );
  let checkedSquares = checkSquaresIfQueen(diagonales, currentQueen);
  let squaresToAttack = checkAttackPossibilityForQueen(
    checkedSquares,
    currentQueen
  );
  console.log("клетки для атаки", squaresToAttack);
  if (squaresToAttack.length == 0) {
    for (i = 0; i < checkedSquares.length; i++) {
      for (j = 0; j < checkedSquares[i].length; j++) {
        let checkedSquareChecker = checkersArray.find(
          (o) => o.name == checkedSquares[i][j]
        );
        console.log("проверяемая шашка", checkedSquareChecker);
        if (
          checkedSquares[i][j] != queenCheckerDiv.name &&
          checkedSquareChecker.color == 0
        ) {
          let squareForMove = document.querySelector(
            `#${checkedSquares[i][j]}`
          );
          squareForMove.classList.add("active-block");
        }
      }
    }
  } else {
    for (i = o; i < squaresToAttack.length; i++) {
      let checkedSquareForAttack = checkersArray.find(
        (o) => o.name == squaresToAttack[i]
      );
    }
  }
}

//Показ хода
function showMoves(checker) {
  for (let blackBlock of blackBlocks) {
    blackBlock.classList.remove("active-block");
  }
  let currentChecker = checkersArray.find(
    (o) => o.name === checker.parentElement.id
  );
  let checkedSquares = checkSquares(currentChecker);
  for (i = 0; i < checkedSquares.length; i++) {
    let checkedSquare = checkersArray.find((o) => o.name === checkedSquares[i]);
    let square = document.querySelector(`#${checkedSquare.name}`);
    //если шашка атакующая, то рядом с ней есть атакуемые, а значит подсвечиваются следующие клетки за атакуемой
    if (currentChecker.attacking == true && checkedSquare.attacked == true) {
      squareForAttackMove = checkAttackPossibility(
        currentChecker,
        checkedSquare
      );
      square = document.querySelector(`#${squareForAttackMove}`);
      square.classList.add("active-block");
    } else if (
      checkedSquare.color === 0 &&
      currentChecker.color !== 0 &&
      currentChecker.attacking == false
    ) {
      //ограничение по ходу назад, черные могут ходить только в сторону уменьшения числа координаты клетки, белые только в сторону увеличения
      if (
        currentChecker.queen == false &&
        currentChecker.color == 1 &&
        currentChecker.name[1] < checkedSquare.name[1]
      )
        square.classList.add("active-block");
      else if (
        currentChecker.queen == false &&
        currentChecker.color == 2 &&
        currentChecker.name[1] > checkedSquare.name[1]
      ) {
        square.classList.add("active-block");
      }
    }
  }
}

//функция, позволяющая продолжать пожирать шашки после первого пожирания, если это возможно, вызывается на строке 443, введена переменная attackingFlag для работы
function continueToEat(checkerFromCheckerArray) {
  let checkerFromCheckerArrayDiv = document.querySelector(
    `#${checkerFromCheckerArray.name}`
  ).firstElementChild;
  let possibleCheckersForTurn = document.querySelectorAll(".checker");
  let checkedSquares = checkSquares(checkerFromCheckerArray);
  for (i = 0; i < checkedSquares.length; i++) {
    let checkedSquare = checkersArray.find((o) => o.name === checkedSquares[i]);
    squareForAttackMove = checkAttackPossibility(
      checkerFromCheckerArray,
      checkedSquare
    );
    if (!squareForAttackMove) continue;
    square = document.querySelector(`#${squareForAttackMove}`);
    square.classList.add("active-block");
    checkerFromCheckerArray.attacking = true;
    checkerFromCheckerArray.active = true;
    // console.log(checkerFromCheckerArray);
  }
  if (checkerFromCheckerArray.attacking == true) {
    for (let checker of possibleCheckersForTurn) {
      checker.classList.remove("player-turn");
    }
    checkerFromCheckerArrayDiv.classList.add("player-turn");
  } else {
    attackingFlag = false;
  }
}

//Написал алгоритм на проверку возможности съесть шашку, добавил новые свойства шашкам attacked и attacking, если шашка атакует, то attacking - true, если атакована, то attacked - true
function checkAttackPossibilityForQueen(attackingQueen, array) {
  arrayOfHollowFieldsToEat = [];
  for (i = 0; i < array.length; i++) {
    let attackingQueenIndex = array[i].indexOf(attackingQueen.name);
    for (j = 0; j < array[i].length; j++) {
      let counter = 1;
      // if (!array[i][j + 1] || !array[i][j - 1]) break;
      let checkerForEat = checkersArray.find((o) => o.name == array[i][j]);
      if (
        attackingQueen.color == checkerForEat.color ||
        checkerForEat.color == 0 ||
        !checkerForEat.color
      ) {
        return;
      }
      let indexCheckerForEat = array.indexOf(checkerForEat.name);
      let nextField = checkersArray.find(
        (o) => o.name == array[i][j + counter]
      );
      let previousField = checkersArray.find(
        (o) => o.name == array[i][j - counter]
      );
      if (
        checkerForEat.color != attackingQueen.color &&
        checkerForEat.color != 0
      ) {
        if (
          attackingQueenIndex < indexCheckerForEat &&
          nextField &&
          nextField.color == 0
        ) {
          console.log("шашка для атаки, если выше", checkerForEat);
          checkerForEat.attacked = true;
          arrayOfHollowFieldsToEat.push(nextField.name);
          counter = 2;
          while (nextField && nextField.color == 0) {
            arrayOfHollowFieldsToEat.push(nextField.name);
            counter++;
          }
        }
        if (
          attackingQueenIndex > indexCheckerForEat &&
          previousField &&
          previousField.color == 0
        ) {
          console.log("шашка для атаки, если ниже", checkerForEat);
          checkerForEat.attacked = true;
          arrayOfHollowFieldsToEat.push(previousField.name);
          counter = 2;
          while (previousField && previousField.color == 0) {
            arrayOfHollowFieldsToEat.push(previousField.name);
            counter++;
          }
        }
      }
    }
  }
  return arrayOfHollowFieldsToEat;
}

function checkAttackPossibility(attackingChecker, attackedChecker) {
  let squareToAttack = "";
  let squareToAttackFirstSymbol;
  let squareToAttackSecondSymbol;
  // console.log(attackingChecker);
  // console.log(attackedChecker);
  if (
    attackingChecker.color == attackedChecker.color ||
    attackedChecker.color == 0 ||
    !attackedChecker
  ) {
    return;
  }
  //суть алгоритма описал в тексте
  let indexLetterAttacking = letterArray.indexOf(attackingChecker.name[0]);
  let indexLetterAttacked = letterArray.indexOf(attackedChecker.name[0]);
  let indexNumberAttacked = numberArray.indexOf(attackedChecker.name[1]);
  if (indexLetterAttacking > indexLetterAttacked) {
    squareToAttackFirstSymbol = letterArray[indexLetterAttacked - 1];
  } else {
    squareToAttackFirstSymbol = letterArray[indexLetterAttacked + 1];
  }
  if (attackingChecker.name[1] > attackedChecker.name[1]) {
    squareToAttackSecondSymbol = numberArray[indexNumberAttacked - 1];
  } else {
    squareToAttackSecondSymbol = numberArray[indexNumberAttacked + 1];
  }
  squareToAttack = squareToAttackFirstSymbol + squareToAttackSecondSymbol;
  // console.log(squareToAttack);
  if (!squareToAttack) {
    return;
  }
  let newPositionOfAttackingChecker = checkersArray.find(
    (o) => o.name === squareToAttack
  );
  // console.log(newPositionOfAttackingChecker);
  if (!newPositionOfAttackingChecker) {
    return;
  }
  if (newPositionOfAttackingChecker.color == 0) {
    attackedChecker.attacked = true;
    // console.log(attackedChecker);
    return squareToAttack;
  }
}

//Сделать ход
function makeMove(activeBlackBlock) {
  let movedChecker = checkersArray.find((o) => o.active === true); //ищем активную шашку со свойством active = true, которая всегда только одна;

  // console.log(movedChecker);

  let newChecker = checkersArray.find((o) => o.name === activeBlackBlock.id); //это будущая шашка, которая появится на подсвеченном блоке

  // console.log(newChecker);

  let removedCheckerDiv = document.querySelector(
    `#${movedChecker.name}`
  ).firstElementChild; // сам div-шашка

  // console.log(removedCheckerDiv);

  //Манипуляция с классами контейнеров и переписывание свойств вовлечённых в ход объектов из массива
  if (movedChecker.color === 1) {
    activeBlackBlock.firstElementChild.classList.add(
      "checker",
      "white-checker",
      "active-checker"
    );
    newChecker.color = 1;
    newChecker.checkIfQueen();
    if (newChecker.queen == true) {
      activeBlackBlock.firstElementChild.classList.add("white-queen");
    }
  }
  if (movedChecker.color === 2) {
    activeBlackBlock.firstElementChild.classList.add(
      "checker",
      "black-checker",
      "active-checker"
    );
    newChecker.color = 2;
    newChecker.checkIfQueen();
    if (newChecker.queen == true) {
      activeBlackBlock.firstElementChild.classList.add("black-queen");
    }
  }
  //Удаление съедаемой шашки
  if (movedChecker.attacking == true) {
    let indexLetterMovedChecker = letterArray.indexOf(movedChecker.name[0]);
    let indexLetterNewChecker = letterArray.indexOf(newChecker.name[0]);
    let eatenCheckerNameLetter =
      letterArray[(indexLetterMovedChecker + indexLetterNewChecker) / 2];
    let eatenCheckerNameNumber =
      (+movedChecker.name[1] + +newChecker.name[1]) / 2;
    let eatenCheckerName = eatenCheckerNameLetter + eatenCheckerNameNumber;
    let eatenChecker = checkersArray.find((o) => o.name == eatenCheckerName);
    // console.log("съедаемая шашкa", eatenChecker);
    let eatenCheckerDiv = document.querySelector(
      `#${eatenCheckerName}`
    ).firstElementChild;
    eatenChecker.color = 0;
    eatenCheckerDiv.className = "";
    attackingFlag = true;
  }
  removedCheckerDiv.className = "";
  if (movedChecker.queen == true) {
    newChecker.queen = true;
    if (movedChecker.color == 1)
      activeBlackBlock.firstElementChild.classList.add("white-queen");
    else {
      activeBlackBlock.firstElementChild.classList.add("black-queen");
    }
  }
  movedChecker.color = 0;
  movedChecker.queen = false;
  checkersArray.forEach((item) => {
    item.attacked = false;
    item.attacking = false;
    item.active = false;
  });
  for (let blackBlock of blackBlocks) {
    blackBlock.classList.remove("active-block");
  }
  // console.log(checkersArray);
  return newChecker;
}
// переход хода

function moveTransition(firstMove = false) {
  let checkersDivCollection = document.querySelectorAll(".checker");
  if (!firstMove) turn = !turn;
  let color = turn ? "white" : "black";
  let colorCheck;
  if (color == "white") {
    colorCheck = 1;
  } else {
    colorCheck = 2;
  }
  // console.log(colorCheck);
  for (let checker of checkersDivCollection) {
    checker.classList.remove("player-turn");
    checker.classList.remove("active-checker");
    let currentChecker = checkersArray.find(
      (o) => o.name === checker.parentElement.id
    );
    let squaresForMove = checkSquares(currentChecker);

    for (i = 0; i < squaresForMove.length; i++) {
      let squareForMove = checkersArray.find(
        (o) => o.name === squaresForMove[i]
      );

      //Здесь шашка проверяется на возможность съесть, если съесть можно, то присваивается шашке attacking = true, а потом на строке 310 получаем массив из attacking-шашек
      let possibleAttack = checkAttackPossibility(
        currentChecker,
        squareForMove
      );
      // console.log(possibleAttack);
      if (possibleAttack && currentChecker.color == colorCheck) {
        currentChecker.attacking = true;
      }
      // console.log(squareForMove);
      // console.log(squaresForMove);
      // console.log(squareForMove);
      if (
        checker.classList.contains(`${color}-checker`) &&
        squareForMove.color == 0
      ) {
        checker.classList.add("player-turn");
      }
    }
  }
  let attackingCheckersArray = checkersArray.filter(
    (checker) => checker.attacking == true
  );
  // console.log(attackingCheckersArray);

  //Подсвечиваются только шашки, которые могут съедать
  if (attackingCheckersArray.length > 0) {
    for (let checker of checkersDivCollection) {
      // console.log(checker);
      checker.classList.remove("player-turn");
    }
    for (i = 0; i < attackingCheckersArray.length; i++) {
      let attackingCheckerDiv = document.querySelector(
        `#${attackingCheckersArray[i].name}`
      );
      if (
        attackingCheckerDiv.firstElementChild.classList.contains(
          `${color}-checker`
        )
      ) {
        attackingCheckerDiv.firstElementChild.classList.add("player-turn");
      }
    }
  }
}

function addEventToBoard() {
  board.addEventListener("click", function (e) {
    let clickedChecker = e.target;
    let currentClickedChecker = checkersArray.find(
      (o) => o.name == clickedChecker.parentElement.id
    );
    let checkersDivCollection = document.querySelectorAll(".checker");
    let isClickActiveBlock = clickedChecker.classList.contains("active-block");
    //добавил оформление активной шашки, на которую кликнул
    if (clickedChecker.classList.contains("checker")) {
      for (let checker of checkersDivCollection) {
        checker.classList.remove("active-checker");
      }
      clickedChecker.classList.add("active-checker");
    }
    // если ход другого игрока и клик мимо 'active-block' выходим из функции (return)
    if (
      !clickedChecker.classList.contains("player-turn") &&
      !isClickActiveBlock
    ) {
      return;
    }

    let checkerColor;
    if (turn) {
      checkerColor = "white-checker";
    } else {
      checkerColor = "black-checker";
    }
    if (clickedChecker.classList.contains(checkerColor)) {
      checkersArray.forEach((item) => {
        item.active = false;
      });
      checkersArray.forEach((item) => {
        if (item.name === clickedChecker.parentElement.id) {
          item.active = true;
        }
      });
      if (currentClickedChecker.queen == false) {
        showMoves(clickedChecker);
      } else {
        showQueenMoves(clickedChecker);
      }
    }
    if (isClickActiveBlock) {
      let movedChecker = makeMove(clickedChecker);
      if (attackingFlag) {
        continueToEat(movedChecker); //заново кликать на шашку каждый раз не нужно, она остаётся активной, пока множественное взятие не будет реализовано, надо кликать просто на подсвеченные блоки
      }
      // console.log(attackingFlag);
      if (!attackingFlag) {
        //пока attackingFlag не станет false, функция перехода хода не вызывается. attackingFlag изменяет свои значения на 214 и 314 строках
        moveTransition();
      }
    }
  });
}
