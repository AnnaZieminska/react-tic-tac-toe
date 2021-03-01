import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {
    render() {
        const winner = this.props.winner
            ? this.props.winner.find(
                  winner =>
                      winner.x === this.props.square.x &&
                      winner.y === this.props.square.y
              )
            : null;

        return (
            <button
                className={`square ${winner ? 'winner' : ''}`}
                onClick={this.props.onClick}
            >
                {this.props.square.sign}
            </button>
        );
    }
}

class Board extends React.Component {
    renderSquare(i, x, y) {
        console.log(i);
        return (
            <Square
                key={i}
                winner={this.props.winner}
                square={this.props.squares[i]}
                onClick={() => this.props.onClick({ i: i, x: x, y: y })}
            />
        );
    }

    renderRow(j) {
        const rows = [];
        for (let a = 0; a < 3; a++) {
            const index = a + j * 3;
            rows.push(this.renderSquare(index, a + 1, j + 1));
        }

        return rows;
    }

    renderGrid() {
        const cols = [];
        for (let i = 0; i < 3; i++) {
            cols.push(
                <div key={i} className='board-row'>
                    {this.renderRow(i)}
                </div>
            );
        }
        return cols;
    }

    render() {
        return <div>{this.renderGrid()}</div>;
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        const squares = [];
        for (let i = 0; i < 9; i++) {
            squares.push({
                sign: null,
                x: null,
                y: null
            });
        }
        this.state = {
            history: [
                {
                    squares: squares
                }
            ],
            stepNumber: 0,
            xIsNext: true,
            sortAsc: true
        };
    }

    handleClick(event) {
        const index = event.i;
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        let squares = current.squares;
        if (calculateWinner(squares) || squares[index].sign) {
            return;
        }

        squares = squares.map((square, i) => {
            if (i === index) {
                return {
                    sign: this.state.xIsNext ? 'X' : 'O',
                    x: event.x,
                    y: event.y,
                    clicked: true
                };
            } else {
                return { ...square, clicked: false };
            }
        });

        this.setState({
            history: history.concat([
                {
                    squares: squares
                }
            ]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: step % 2 === 0
        });
    }

    renderMoves(move, clicked, desc) {
        return (
            <li key={move}>
                <button onClick={() => this.jumpTo(move)}>
                    {this.state.stepNumber === move ? (
                        <b>{desc}</b>
                    ) : (
                        <span>{desc}</span>
                    )}
                </button>
                <span>
                    {clicked?.x} {clicked?.y}
                </span>
            </li>
        );
    }

    getMoves() {
        const history = this.state.history;
        const moves = history
            ? history.map((step, move) => {
                  const desc = move
                      ? 'Go to move #' + move
                      : 'Go to game start';
                  const clicked = history[move].squares.find(
                      square => square.clicked
                  );

                  return this.renderMoves(move, clicked, desc);
              })
            : [];

        return this.state.sortAsc ? moves : moves.reverse();
    }

    sortMoves() {
        this.setState({
            sortAsc: !this.state.sortAsc
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);
        let status;
        if (winner) {
            status = 'Winner: ' + winner[0].sign;
        } else if (this.state.stepNumber !== 9) {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        } else {
            status = 'Remis';
        }

        return (
            <div className='game'>
                <div className='game-board'>
                    <Board
                        squares={current.squares}
                        winner={winner}
                        onClick={event => this.handleClick(event)}
                    />
                </div>
                <div className='game-info'>
                    <div>{status}</div>
                    <button onClick={event => this.sortMoves()}>Sort</button>
                    <ol>{this.getMoves()}</ol>
                </div>
            </div>
        );
    }
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (
            squares[a].sign &&
            squares[a].sign === squares[b].sign &&
            squares[a].sign === squares[c].sign
        ) {
            return [squares[a], squares[b], squares[c]];
        }
    }
    return null;
}

// ========================================

ReactDOM.render(<Game />, document.getElementById('root'));
