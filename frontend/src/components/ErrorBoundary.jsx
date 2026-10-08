import { Component } from 'react'
// Last-resort guard so a render error shows a calm message instead of a blank screen.
export default class ErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(e) { console.error(e) }
  render() {
    return this.state.failed ? <div className="empty" style={{ minHeight: '70vh', alignContent: 'center' }}><h2>Something went wrong</h2><p>An unexpected error occurred. Reloading the page usually fixes it.</p><button className="btn p" onClick={() => window.location.reload()}>Reload page</button></div> : this.props.children
  }
}
