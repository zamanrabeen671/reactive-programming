import logo from "./logo.svg";
import "./App.css";
import { from, BehaviorSubject } from "rxjs";
import {
  map,
  filter,
  mergeMap,
  delay,
  debounceTime,
  distinctUntilChanged,
} from "rxjs/operators";
import { useEffect, useState } from "react";

let getPokemon = async (name) => {
  const { results: allPokemons } = await fetch(
    "https://pokeapi.co/api/v2/pokemon/?limit=100"
  ).then((res) => res.json());
  console.log(allPokemons)
  return allPokemons.filter((pokemon) => pokemon.name.includes(name));
};
let searchSubject = new BehaviorSubject("");
let searchResultObservable = searchSubject.pipe(
  filter((val) => val.length > 1),
  debounceTime(750),
  distinctUntilChanged(),
  mergeMap((val) => from(getPokemon(val)))
);

const useObservable = (observable, setter) => {
  useEffect(() => {
    let subscription = observable.subscribe((result) => {
      console.log(result);
      setter(result);
    });
    return () => subscription.unsubscribe();
  }, [observable, setter]);
};
function App() {
  const [search, setSearch] = useState("");
  const [result, setResult] = useState([]);

  useObservable(searchResultObservable, setResult);
  const handleChange = (e) => {
    const newValue = e.target.value;
    setSearch(newValue);
    searchSubject.next(newValue);
  };
  return (
    <div className="App">
      <h1>Hello world</h1>
      <input
        type="text"
        placeholder="search"
        value={search}
        onChange={handleChange}
      />

      <div>{JSON.stringify(result, null, 2)}</div>
    </div>
  );
}

export default App;
