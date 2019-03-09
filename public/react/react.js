/*const name = 'khang';
const element = <h1>Hello, {name}</h1>;

ReactDOM.render(
  element,
  document.getElementById('root')
);
*/

class Greeting extends React.Component {
    render() {
        return (<p>Hello world</p>);
    }
}

class Khang extends React.Component{
    render() {
      return (
      <div>
        <h1 className="Yellow">My Demo Reactjs</h1>
        <h2>Test with Postman</h2>
        <h2>User</h2>
        <h3>/user/:id</h3>/h3>
        <h3>/user/login</h3><p>email : invisibledark4@gmail.com </p><p>pass : khang</p>
        <h3>/user/sign_up</h3>
        <h3>/logout</h3>
      </div>
      );
    }
}

ReactDOM.render(
  <div>
    <Khang />
  </div>
  ,
    document.getElementById('root')
);
