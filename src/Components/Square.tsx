import * as React from 'react';
import update from 'immutability-helper';
import bind from 'bind-decorator';
import { Row, Col, Modal, ModalBody, ModalHeader, ModalFooter, FormGroup } from 'reactstrap';
import Point from './Point';
const uuidv1 = require('uuid/v1');

interface PointItem {
  id: string;
  isActive: boolean;
}

export interface ISquareProps {
    sizeSquare: number;
}

interface ISquareState {
  items: PointItem[][];
  prevItems: string;
  isGameOver: boolean;
  isStartGame: boolean;
  showModalGameOver: boolean;
  gameOverMessage: string;
}

export default class Square extends React.Component<ISquareProps, ISquareState> {
    public constructor(props: ISquareProps) {
      super(props);

      const items: PointItem[][] = [];

      for (var i = 0; i < props.sizeSquare; i++) {
        items[i] = [];

        for (var j = 0; j < props.sizeSquare; j++) {
          items[i][j] = {
            id: uuidv1(),
            isActive: false
          }
        }
      }

      this.state = {
        items,
        prevItems: JSON.stringify(items),
        isGameOver: false,
        isStartGame: false,
        showModalGameOver: false,
        gameOverMessage: ''
      }
    }

    private getNeighbors(i: number, j: number) {
      const neighbors: PointItem[] = [];
      const items = this.state.items;

      if (i > 0) {
        neighbors.push(items[i - 1][j]);

        if (j > 0) {
          neighbors.push(items[i - 1][j - 1]);
        }

        if (j < this.props.sizeSquare - 1) {
          neighbors.push(items[i - 1][j + 1]);
        }
      }

      if (i < this.props.sizeSquare - 1) {
        neighbors.push(items[i + 1][j]);

        if (j > 0) {
          neighbors.push(items[i + 1][j - 1]);
        }

        if (j < this.props.sizeSquare - 1) {
          neighbors.push(items[i + 1][j + 1]);
        }
      }

      if (j > 0) {
        neighbors.push(items[i][j - 1]);
      }

      if (j < this.props.sizeSquare - 1) {
        neighbors.push(items[i][j + 1]);
      }

      return neighbors;
    }

    @bind
    private checkLifePoints() : boolean {
      for (var i = 0; i < this.props.sizeSquare; i++) {
        for (var j = 0; j < this.props.sizeSquare; j++) {
          if(this.state.items[i][j].isActive) {
            return true;
          }
        }
      }
      return false;
    }

    @bind
    private checkModifyPoints(prevItems: PointItem[][]) : boolean {
      for (var i = 0; i < this.props.sizeSquare; i++) {
        for (var j = 0; j < this.props.sizeSquare; j++) {
          if (this.state.items[i][j].isActive !== prevItems[i][j].isActive) {
            return true;
          }
        }
      }

      return false;
      
    }

    private clearBoard(items: PointItem[][]) {
      for (var i = 0; i < this.props.sizeSquare; i++) {
        for (var j = 0; j < this.props.sizeSquare; j++) {
          items[i][j].isActive = false;
        }
      }

      return items;
    }

    @bind
    private setActivePoint(i: number, j: number) {
      if (!this.state.isGameOver) {
       this.setState(prevState => update(prevState, {items: {[i]: {[j]: {isActive: {$set: !prevState.items[i][j].isActive}}}}}));
      }
    }

    @bind
    private checkEndGame(prevItems: PointItem[][]) {
      if (!this.checkModifyPoints(prevItems)) {
        this.showModal('Игра звершена по причине отсутствия изменений.');
        return true;
      }

      if (!this.checkLifePoints()) {
        this.showModal('Игра звершена по причине отсутствия живых клеток.');
        return true;
      }
    }

    @bind
    private onCkickStart() {
      this.start();
      
      this.setState(prevState => update(prevState, {isStartGame: {$set: true}}));
    }

    @bind
    private start() {
      this.playRound().then(() => {
        if (this.checkEndGame(JSON.parse(this.state.prevItems))) {
          this.setState(prevState => update(prevState, {isGameOver: {$set: true}}));
        } else {
          setTimeout(this.start, 1000);
        }
  
        this.setState(prevState => update(prevState, {prevItems: {$set: JSON.stringify(this.state.items)}}));
      });   
    }

    @bind
    private startNewGame() {
      this.setState(prevState => update(prevState, {
        items: {$set: this.clearBoard(prevState.items)},
        isGameOver: {$set: false}
      }))
    }
 
    @bind
    private closeModal() {
      this.setState(prevState => update(prevState, {
        showModalGameOver: {$set: false},
        gameOverMessage: {$set: ''}
      }));
    }

    @bind
    private showModal(message: string) {
      this.setState(prevState => update(prevState, {
        showModalGameOver: {$set: true},
        gameOverMessage: {$set: message},
        isStartGame: {$set: false}
      }));
    }

    @bind
    private async playRound() {

        const newItems = [...this.state.items];

        for (var i = 0; i < this.props.sizeSquare; i++) {
          for (var j = 0; j < this.props.sizeSquare; j++) {
            const currentItem = this.state.items[i][j];
            const lifeNeighbors = this.getNeighbors(i, j).filter(x => x.isActive).length;

            if (currentItem.isActive && (lifeNeighbors < 2 || lifeNeighbors > 3)) {
              newItems[i][j].isActive = false;
            }

            if (!currentItem.isActive && (lifeNeighbors === 3)) {
              newItems[i][j].isActive = true;
            }
          }
        }
        
        this.setState(prevState => update(prevState, {
          items: {$set: newItems} 
        }));
    }

    render() {
        return (
            <div className='container'>
              <Modal isOpen={this.state.showModalGameOver} >
                <ModalHeader toggle={this.closeModal}>Игра завершена</ModalHeader>
                <ModalBody>
                  {this.state.gameOverMessage}
                </ModalBody>
                <ModalFooter>
                  <button type='button' className='btn btn-primary' onClick={this.closeModal}>Закрыть</button>
                </ModalFooter>
              </Modal>
              <FormGroup>
                <button
                 type='button'
                 className='btn btn-primary start-btn'
                 disabled={this.state.isStartGame}
                 onClick={this.state.isGameOver ? this.startNewGame : this.onCkickStart}>{this.state.isGameOver ? 'Рестарт' : 'Начать игру'}</button>
              </FormGroup>
              <hr/>
              <div className='game-zone'>
                {this.state.items.map((itemsRow, i) => { return (
                  <Row key={'row_' + i}>
                    {itemsRow.map((itemsCol, j) => { return (
                      <Col xs='auto' className='column' key={'col' + itemsCol.id}><Point isActive={itemsCol.isActive} onClick={() => this.setActivePoint(i, j)}/></Col>
                    )})}
                  </Row>
                )           
                })}
              </div>
            </div>
        )}
}