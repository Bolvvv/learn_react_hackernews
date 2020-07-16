import React, { Component } from 'react';
import './App.css';

//ES6解构
// const users = ['Robin', 'Andrew', 'Dan'];
// const [
// userOne,
// userTwo,
// userThree
// ] = users;
// console.log(userOne, userTwo, userThree);

//判断关键词对应行是否存在
function isSearched(searchTerm){
  return function(item) {
    return item.title.toLowerCase().includes(searchTerm.toLowerCase());
  }
}

//展示列表宽度设置
const largeColumn = {
width: '40%',
};
const midColumn = {
width: '30%',
};
const smallColumn = {
width: '10%',
};

//api请求参数
const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page='
const PARAM_HPP = 'hitsPerPage='
const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}&${PARAM_PAGE}`;

console.log(url)



//简化版函数
// const isSearched = searchTerm => item => item.title.toLowerCase().includes(searchTerm.toLowerCase());

class App extends Component{
  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
    };
    //绑定对应函数到该类中
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
  }

  needsToSearchTopStories(searchTerm){
    return !this.state.results[searchTerm];
  }

  setSearchTopStories(result){
    const {hits, page} = result;
    const {searchKey, results} = this.state;
    //如果page!==0，表示已经有过more点击了，即state.result.hits中已经存在内容
    const oldHits = results && results[searchKey] ? results[searchKey].hits : [];


    const updatedHits = [...oldHits, ...hits];//拼接新老Hits

    this.setState({ 
      results: {
        ...results,
        [searchKey]: { hits:updatedHits, page }
      }
     })
  }

  fetchSearchTopStories(searchTerm, page=0){
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(response => response.json())
      .then(result => this.setSearchTopStories(result))
      .catch(e => this.setState({error: e}));
  }

  //react生命周期，componentDidMount在页面首次渲染的render执行之后在执行，在此阶段进行api调用后会
  //发起update生命周期，从而再次render
  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  onDismiss(id){
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    //简写函数定义
    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);
    //上述两行还可以简写为
    //const updateHits = this.state.result.hits.filter(item => item.objectID !== id)

    this.setState({
      // result: Object.assign({}, this.state.result, { hits: updateHits })
      //es6特定语法，用于对数组进行扩展操作.这一步将更新result里面的hits属性
      results:{
        ...results,
        [searchKey]: {hits: updatedHits, page}
      }
    });
  }

  onSearchChange(event){
    this.setState({
      searchTerm: event.target.value
    });
  }

  onSearchSubmit(event){
    const { searchTerm } = this.state;
    this.setState({searchKey: searchTerm})

    if(this.needsToSearchTopStories(searchTerm)){
      this.fetchSearchTopStories(searchTerm);
    }

    event.preventDefault();//阻止页面在提交表单后自动刷新，由react控制进行局部更新
  }
  render() {
    //解构
    const { searchTerm, results, searchKey, error } = this.state;
    const page = (results && results[searchKey] &&results[searchKey].page) || 0;
    const list = (results && results[searchKey] &&results[searchKey].hits) || [];

    return (
      <div className="page">
        <div className="interactions">
          <Search 
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
        </div>
        {/* 条件渲染 */}
        {error
          ?
          <div className="interactions">
            <p>Something went wrong.</p>
          </div> :
          <Table 
          list={list}
          onDismiss={this.onDismiss}
          />
        }
        <div className="interactions">
          <Button onClick={()=>this.fetchSearchTopStories(searchKey, page+1)}>
            More
          </Button>
        </div>
      </div>
    );
  }
}

//重构为无状态组件,并且在函数括号中对参数进行解构(既是props)，同时省略return
const Search = ({ value, onChange, onSubmit, children }) =>
  <form onSubmit={onSubmit}>
    <input
      type="text"
      value={value}
      onChange={onChange}
    />
    <button type="submit">{children}</button>
  </form>

const Table = ({list, pattern, onDismiss }) => 
  //简写函数和return
  <div className="table">
    {list.map(item =>
      <div key={item.objectID} className="table-row">
        <span style={largeColumn}>
          <a href={item.url}>{item.title}</a>
        </span>
        <span style={midColumn}>
          {item.author}
        </span>
        <span style={smallColumn}>
          {item.num_comments}
        </span>
        <span style={smallColumn}>
          {item.points}
        </span>
        <span style={smallColumn}>
          <Button
            onClick={()=>onDismiss(item.objectID)}
            className="button-inline"
          >
            Dismiss
          </Button>
        </span>
      </div>
    )}
  </div>

const Button = ({onClick, className, children}) =>
  <button
    onClick={onClick}
    className={className}
    type="button"
  >
    {children}
  </button>

export default App;
