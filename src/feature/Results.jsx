import Pokemon from "../components/Pokemon/Pokemon";

const Results = ({ pokemons }) => {
  return (
    <div className="search">
      {!pokemons.length ? (
        <h3>No Pokémon Found</h3>
      ) : (
        pets.map((pet) => {
          return (
            <Pokemon
              animal={pet.animal}
              key={pet.id}
              name={pet.name}
              breed={pet.breed}
              images={pet.images}
              location={`${pet.city}, ${pet.state}`}
              id={pet.id}
            />
          );
        })
      )}
    </div>
  );
};

export default Results;