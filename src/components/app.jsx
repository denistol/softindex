import React, { Component } from "react"
import { orderBy } from 'lodash'
import firebase from '../../firebase-connect'
import '../../node_modules/bootstrap/dist/css/bootstrap-reboot.min.css'
import '../../node_modules/bootstrap/dist/css/bootstrap-grid.min.css'
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css'
import '../scss/base.scss'
import Input from './input.jsx'
import Spinner from './spinner.jsx'

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            users: null,
            error: null,
            searchBy: '',
            orderDirection: true,
            orderBy: 'id',
            inputParams: [
                {
                    isValid: false,
                    type: 'text',
                    name: 'firstName',
                    placeholder: 'first name',
                    data: null
                },
                {
                    isValid: false,
                    type: 'text',
                    name: 'lastName',
                    placeholder: 'last name',
                    data: null
                },
                {
                    isValid: false,
                    type: 'tel',
                    name: 'phone',
                    placeholder: 'phone',
                    data: null,
                },
                {
                    isValid: false,
                    type: 'number',
                    name: 'age',
                    placeholder: 'age',
                    data: null
                }
            ]
        }

        this.writeUser = this.writeUser.bind(this)
        this.removeUser = this.removeUser.bind(this)
        this.searchInputChange = this.searchInputChange.bind(this)
        this.checkInput = this.checkInput.bind(this)
        this.showMessage = this.showMessage.bind(this)

    }
    formIsValid() {
        let paramsLength = this.state.inputParams.length
        let validLength = this.state.inputParams.filter(el => el.isValid).length
        return validLength === paramsLength
    }
    showMessage(msg) {
        this.setState({ error: msg })
        setTimeout(() => this.setState({ error: null }), 3000)
    }
    checkInput(props) {
        this.setState((state) => ({
            inputParams: state.inputParams.map(el => {
                if (el.name == props.name) { // validate
                    el.data = props.value
                    if (props.value.length > 5) {
                        el.isValid = true
                    }
                }
                return el
            })
        }));
    }
    renderUsers() {
        let users = this.state.users
        let dir = this.state.orderDirection
        let ord = this.state.orderBy
        if (!users) return (<span>Users not found</span>)

        let orderedUsers = orderBy(users, ord, dir ? 'asc' : 'desc')
            .filter(el => {
                if (this.state.searchBy.length > 2) {
                    return Object.values(el).join('').toLowerCase().includes(this.state.searchBy.toLowerCase())
                }
                return el
            })
        return (
            orderedUsers.map((user, i) => {
                return (
                    <div key={i} className="d-flex flex-row align-items-center my-2">
                        <small >{user.id} - {user.firstName} {user.lastName}</small>
                        <small onClick={() => this.removeUser(user.id)} className="text-danger ml-2 pointer">remove</small>
                    </div>
                )
            }))

    }
    removeUser(userId) {
        this.setState({ loading: true })
        firebase.database().ref('users/' + userId).remove().then(res => {
        })
    }
    writeUser() {
        if (!this.formIsValid()) {
            let invalid = this.state.inputParams.filter(el => !el.isValid).map(el => el.name)
            this.showMessage(`Invalid input${invalid.length > 1 ? 's' : ''}: ${invalid.join(', ')}`)
            return
        }
        this.setState({ loading: true })
        let randInt = Math.floor(Math.random() * 999)
        let userData = Object.assign({ id: randInt },
            ...this.state.inputParams.map(item => ({ [item['name']]: item.data })))

        firebase.database().ref('users/' + randInt).set(userData, () => {
            let emptyParams = this.state.inputParams.map(el => {
                el.data = null
                el.isValid = false
                return el
            })
            this.setState({ inputParams: emptyParams })
        });
    }
    componentWillMount() {
        firebase.database().ref('/users/').on('value', (snap) => {
            this.setState({ users: snap.val(), loading: false })
        })
    }

    searchInputChange(e) {
        return this.state.users && this.setState({ searchBy: e.target.value })
    }
    setOrderBy(o) {
        this.state.orderBy == o ?
            this.setState({ orderDirection: !this.state.orderDirection }) :
            this.setState({ orderBy: o })
    }
    render() {
        const inputs = this.state.inputParams.map((param, i) => <Input key={i} checkInput={this.checkInput} param={param} />)
        const usersCount = this.state.users ? Object.keys(this.state.users).length : ''
        const sortButtons = [{ name: 'ID' }, ...this.state.inputParams].map((el, i) => {
            return (<small key={i} className="mr-2 text-primary sort-btn" onClick={() => this.setOrderBy(el.name)}>{el.name}</small>)
        })
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-4">
                        <div className="users border p-5 my-5 d-flex flex-column">
                            <h5>Users: {usersCount}</h5>
                            {this.state.loading && <Spinner />}
                            <div className="d-flex-flex-row py-4">
                                <small className="text-secondary">sort by: </small> {sortButtons}
                                <input placeholder="search" onChange={this.searchInputChange} type="text" className="form-control" />
                            </div>
                            {this.renderUsers()}
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className={"form my-5 d-flex border flex-column p-5 " + (this.state.error ? 'has-error' : '')}>
                            <div className="d-flex flex-column justify-content-center align-items-center mb-4">
                                <span className="text-danger">{this.state.error ? this.state.error : ''}</span>
                            </div>
                            {inputs}
                            <button onClick={this.writeUser} className={"btn btn-outline-" + (this.state.error ? 'danger' : 'primary') + " mt-4"}>Add user</button>
                        </div>
                    </div>
                    <div className="col-md-4"></div>
                </div>
            </div>
        )
    }

}

export default App;