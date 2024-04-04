import {pokeApi} from '../../config/api/pokeApi';
import type {Pokemon} from '../../domain/entities/pokemon';
import type {
  PokeAPIPaginatedResponse,
  PokeAPIPokemon,
} from '../../infrastructure/interfaces/pokeApi.interface';
import {PokemonMapper} from '../../infrastructure/mappers/pokemon.mapper';

export const getPokemons = async (
  page: number,
  limit: number = 20,
): Promise<Pokemon[]> => {
  try {
    const url = `/pokemon?offset=${page * 10}&limit=${limit}`;
    const {data} = await pokeApi.get<PokeAPIPaginatedResponse>(url);
    const pokemonPromeses = data.results.map(info => {
      return pokeApi.get<PokeAPIPokemon>(info.url);
    });
    const pokeApiPokemons = await Promise.all(pokemonPromeses);
    const pokemons = pokeApiPokemons.map(item =>
      PokemonMapper.pokeApiPokemonToEntity(item.data),
    );
    console.log('pokemons: ', pokemons[0]);
    return pokemons;
  } catch (error) {
    console.log({error});
    throw new Error('Error getting pokemons');
  }
};
