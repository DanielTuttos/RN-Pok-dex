import {FlatList, Platform, View} from 'react-native';
import {globalTheme} from '../../../config/theme/global-theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ActivityIndicator, Text, TextInput, useTheme} from 'react-native-paper';
import {FullScreenLoader, PokemonCard} from '../../components';
import {Pokemon} from '../../../domain/entities/pokemon';
import {useQuery} from '@tanstack/react-query';
import {
  getPokemonNamesWithId,
  getPokemonsByIds,
} from '../../../actions/pokemons';
import {useMemo, useState} from 'react';
import {useDebounceValue} from '../../hooks/useDebounceValue';

export const SearchScreen = () => {
  const {top} = useSafeAreaInsets();
  const [term, setTerm] = useState('');
  const debouncedValue = useDebounceValue(term);
  const theme = useTheme();

  const {isLoading, data: pokemonNameList = []} = useQuery({
    queryKey: ['pokemons', 'all'],
    queryFn: () => getPokemonNamesWithId(),
  });

  // todo aplicar el debouncer
  const pokemonNameIdList = useMemo(() => {
    // es un numero
    if (!isNaN(Number(debouncedValue))) {
      const pokemon = pokemonNameList.find(
        poke => poke.id === Number(debouncedValue),
      );
      return pokemon ? [pokemon] : [];
    }
    if (debouncedValue.length === 0) return [];
    if (debouncedValue.length < 3) return [];
    return pokemonNameList.filter(pokemon =>
      pokemon.name.includes(debouncedValue.toLocaleLowerCase()),
    );
  }, [debouncedValue]);

  const {isLoading: isLoadingPokemons, data: pokemons = []} = useQuery({
    queryKey: ['pokemons', 'by', pokemonNameIdList],
    queryFn: () =>
      getPokemonsByIds(pokemonNameIdList.map(pokemon => pokemon.id)),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <View style={[globalTheme.globalMargin, {paddingTop: top + 10}]}>
      <TextInput
        placeholder="Buscar Pokemon"
        mode="flat"
        autoFocus
        autoCorrect={false}
        onChangeText={setTerm}
        value={term}
        contentStyle={{color: theme.dark ? 'white' : 'black'}}
      />
      {isLoadingPokemons && <ActivityIndicator style={{paddingTop: 20}} />}
      {/* <Text>{JSON.stringify(pokemonNameIdList, null, 2)}</Text> */}

      <FlatList
        showsVerticalScrollIndicator={false}
        data={pokemons}
        keyExtractor={(pokemon, index) => `${pokemon.id}-${index}`}
        numColumns={2}
        style={{paddingTop: top + 20}}
        renderItem={({item}) => <PokemonCard pokemon={item} />}
        ListFooterComponent={
          <View style={{height: Platform.OS === 'ios' ? 150 : 80}} />
        }
      />
    </View>
  );
};
