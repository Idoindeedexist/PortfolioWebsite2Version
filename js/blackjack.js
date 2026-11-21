class Card {
  constructor(rank, suit) {
    this.rank = rank;
    this.suit = suit;
  }
  getValue() {
    if (["J", "Q", "K"].includes(this.rank)) {
      return 10;
    }
    if (this.rank === "A") {
      return 11;
    }

    return Number(this.rank);
  }
  toString() {
    return this.rank + this.suit;
  }
}
class Deck {
  constructor() {
    this.cards = [];
    const suits = ["♥️", "♦️", "♠️", "♣️"];
    const ranks = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ];

    for (let suit of suits) {
      for (let rank of ranks) {
        this.cards.push(new Card(rank, suit));
      }
    }
    this.shuffle();
  }
  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }
  drawCard() {
    return this.cards.pop();
  }
}
class Hand {
  constructor() {
    this.cards = [];
  }
  addCard(card) {
    this.cards.push(card);
  }
  getTotal() {
    let total = 0;
    let aces = 0;
    for (let card of this.cards) {
      total += card.getValue();
      if (card.rank === "A") {
        aces++;
      }
    }
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    return total;
  }
  isBlackJack() {
    return this.cards.length === 2 && this.getTotal() === 21;
  }
  isBust() {
    return this.getTotal() > 21;
  }
}
class Player {
  constructor() {
    this.balance = 100;
    this.bet = 0;
    this.hand = new Hand();
  }
  placeBet(amount) {
    if (amount <= 0 || amount > this.balance) {
      return false;
    }
    this.balance -= amount;
    this.bet += amount;
    return true;
  }
  allIn() {
    if (this.balance <= 0) {
      return false;
    }
    return this.placeBet(this.balance);
  }
  doubleDown() {
    if (this.balance < this.bet) {
      return false;
    }
    this.balance -= this.bet;
    this.bet *= 2;
    return true;
  }
  resetHand() {
    this.hand = new Hand();
  }
}
class Dealer {
  constructor() {
    this.hand = new Hand();
  }
  resetHand() {
    this.hand = new Hand();
  }
  playTurn(deck) {
    while (this.hand.getTotal() < 17) {
      this.hand.addCard(deck.drawCard());
    }
  }
}
class BlackjackGame {
  constructor() {
    this.player = new Player();
    this.dealer = new Dealer();
    this.deck = null;
    this.phase = "betting";
    this.lastBet = 0;
  }
  startRound() {
    if (this.phase !== "betting" || this.player.bet <= 0) {
      return;
    }
    this.deck = new Deck();
    this.player.resetHand();
    this.dealer.resetHand();
    this.lastBet = this.player.bet;
    this.player.hand.addCard(this.deck.drawCard());
    this.dealer.hand.addCard(this.deck.drawCard());
    this.player.hand.addCard(this.deck.drawCard());
    this.dealer.hand.addCard(this.deck.drawCard());
    this.phase = "playing";
    this.checkInitialBlackjack();
    startGame();
  }
  checkInitialBlackjack() {
    const playerBlackJ = this.player.hand.isBlackJack();
    const dealerBlackJ = this.dealer.hand.isBlackJack();
    if (playerBlackJ && dealerBlackJ) {
      this.player.balance += this.player.bet;
      this.finishRound("Push! Both have Blackjack.");
    } else if (playerBlackJ) {
      this.player.balance += this.player.bet * 2.5;
      this.finishRound("BLACKJACK! You win!");
    } else if (dealerBlackJ) {
      this.finishRound("Dealer has Blackjack. You lose.");
    }
  }
  hit() {
    if (this.phase !== "playing") {
      return;
    }
    this.player.hand.addCard(this.deck.drawCard());
    if (this.player.hand.isBust()) {
      this.finishRound("BUST! You lose.");
    } else if (this.player.hand.getTotal() === 21) {
      this.stand();
    }
    startGame();
  }
  stand() {
    if (this.phase !== "playing") {
      return;
    }
    this.dealer.playTurn(this.deck);
    const playerTotal = this.player.hand.getTotal();
    const dealerTotal = this.dealer.hand.getTotal();
    if (this.dealer.hand.isBust()) {
      this.player.balance += this.player.bet * 2;
      this.finishRound("Dealer busts! You win!");
    } else if (playerTotal > dealerTotal) {
      this.player.balance += this.player.bet * 2;
      this.finishRound("You win!");
    } else if (playerTotal < dealerTotal) {
      this.finishRound("Dealer wins.");
    } else {
      this.player.balance += this.player.bet;
      this.finishRound("Push! Your bet is returned.");
    }
    startGame();
  }
  doubleDown() {
    if (this.phase !== "playing" || this.player.hand.cards.length !== 2) {
      return;
    }
    if (!this.player.doubleDown()) {
      return;
    }
    this.player.hand.addCard(this.deck.drawCard());
    if (this.player.hand.isBust()) {
      this.finishRound("BUST! You lose.");
    } else {
      this.stand();
    }
    startGame();
  }
  finishRound(message) {
    this.phase = "finished";
    this.lastMessage = message;
    this.player.bet = 0;
  }
}
class ShiftManager {
  constructor() {
    this.activeShifts = [];
  }
  addShoft(shift) {
    this.activeShifts.push(shift);
  }
}

function displayCards(hand, hideFirst = false) {
  return hand.cards
    .map((card, index) => {
      if (hideFirst && index === 0) {
        return `<div class="playing-card hidden-card">?</div>`;
      }
      const red = ["♥️", "♦️"].includes(card.suit);
      return `<div class="playing-card ${red ? "red-card" : ""}">${card.toString()}</div>`;
    })
    .join("");
}

function startGame() {
  const player = game.player;
  const dealer = game.dealer;
  const playing = game.phase === "playing";
  const betting = game.phase === "betting";
  const finished = game.phase === "finished";
  document.getElementById("bal").textContent = player.balance;
  document.getElementById("curBet").textContent = player.bet;
  document.getElementById("playHand").innerHTML = displayCards(player.hand);
  document.getElementById("dealHand").innerHTML = displayCards(
    dealer.hand,
    playing,
  );
  document.getElementById("playTotal").textContent =
    player.hand.cards.length > 0 ? player.hand.getTotal() : 0;
  document.getElementById("dealTotal").textContent =
    playing && dealer.hand.cards.length > 0
      ? "?"
      : dealer.hand.cards.length > 0
        ? dealer.hand.getTotal()
        : 0;
  document.getElementById("gameMess").textContent = playing
    ? "Your turn!"
    : finished
      ? game.lastMessage
      : "Place your bet to begin.";
  document.querySelectorAll(".betButton").forEach((button) => {
    const amount = Number(button.dataset.bet);
    button.disabled = !betting || amount > player.balance;
  });
  document.getElementById("allInButton").disabled =
    !betting || player.balance <= 0;
  document.getElementById("dealButton").disabled =
    !(betting && player.bet > 0) && !finished;
  document.getElementById("dealButton").textContent = finished
    ? "NEW ROUND"
    : "DEAL";
  document.getElementById("hitButton").disabled = !playing;
  document.getElementById("standButton").disabled = !playing;
  document.getElementById("doubButton").disabled =
    !playing || player.hand.cards.length !== 2 || player.balance < player.bet;
  const shiftsContainer = document.getElementById("shiftCon");
  shiftsContainer.innerHTML =
    ManagesShifts.activeShifts.length === 0
      ? "<p>No Shifts equipped.</p>"
      : ManagesShifts.activeShifts
          .map((shift) => `<p>${shift.name}</p>`)
          .join("");
}
document.querySelectorAll(".betButton").forEach((button) => {
  button.addEventListener("click", () => {
    const amount = Number(button.dataset.bet);
    game.player.placeBet(amount);
    startGame();
  });
});
document.getElementById("allInButton").addEventListener("click", () => {
  game.player.allIn();
  startGame();
});
document.getElementById("dealButton").addEventListener("click", () => {
  if (game.phase === "finished") {
    game.phase = "betting";
    game.lastMessage = "";
    startGame();
  } else {
    game.startRound();
  }
});
document.getElementById("hitButton").addEventListener("click", () => {
  game.hit();
});
document.getElementById("standButton").addEventListener("click", () => {
  game.stand();
});
document.getElementById("doubButton").addEventListener("click", () => {
  game.doubleDown();
});

const game = new BlackjackGame();
const ManagesShifts = new ShiftManager();
startGame();
