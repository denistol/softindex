import React, { Component } from 'react'

export default class extends Component {
    constructor(props) {
        super(props)
        this.handleChange = this.handleChange.bind(this)
    }
    handleChange(e) {
        let inputData = { value: e.target.value, name: this.props.param.name }
        this.props.checkInput(inputData)
    }
    render() {
        let type = this.props.param.type
        let name = this.props.param.name
        let placeholder = this.props.param.placeholder
        let data = this.props.param.data || ''
        return (<input className="form-control my-1" onChange={this.handleChange} value={data} type={type} name={name} placeholder={placeholder} />)

    }
}