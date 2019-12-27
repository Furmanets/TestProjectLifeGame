import * as React from 'react';
import update from 'immutability-helper';
import { Label, Input, Form, FormGroup } from 'reactstrap';
import Square from './Components/Square';
import './common';
import './Style/style.css';

interface IGameLifeProps {}

interface IGameLifeState {
  startGame: boolean;
  sizeSquare: number;
  errorMessage?: string;
}

export default class GameLife extends React.Component<IGameLifeProps, IGameLifeState> {
    public constructor(props: any) {
      super(props);

      this.state = {
        startGame: false,
        sizeSquare: 0
      }
    }

    private startGame(e: any) {
      e.preventDefault();
      
      if (this.state.sizeSquare) {
        if (this.state.sizeSquare > 0) {
          this.setState(prevState => update(prevState, {startGame: {$set: true}}));
        } else {
          this.setState(prevState => update(prevState, {errorMessage: {$set: 'Размер поля должен быть больше чем 0'}}));
        }

      } else {
        this.setState(prevState => update(prevState, {errorMessage: {$set: 'Вы не ввели размер поля'}}));
      }
    }

    render() {
      return (
        <>
          <FormGroup className='title-block'>
            <h1>Игра "Жизнь"</h1>
          </FormGroup>
          
          {!this.state.startGame && <Form className='form-start' onSubmit={e => this.startGame(e)}>
              <FormGroup>
                <Label>Размер поля</Label>
                <Input
                  placeholder='Введите размер поля'
                  className='form-input'
                  type='number'
                  onChange={e => 
                    {
                      const size: number = parseInt(e.target.value);
                      this.setState(prevState => update(prevState, {sizeSquare: {$set: size}}))
                    }
                  }
                />
              </FormGroup>
              <FormGroup>
                <button className='btn btn-primary' type='submit'>Старт</button>
              </FormGroup>
          </Form>}
          {this.state.startGame && <Square sizeSquare={this.state.sizeSquare}/>}
        </>
    )}
}