import * as React from 'react';
import '../Style/point.css';

export interface IPointProps {
    isActive: boolean;
    onClick: () => void;
}

export default class Point extends React.Component<IPointProps, {}> {
    render() {
        return (
            <div className={'point' + (this.props.isActive ? ' active' : '')} onClick={this.props.onClick}/>
        )}
}