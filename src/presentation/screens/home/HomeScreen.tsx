import {FlatList, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import {getPokemons} from '../../../actions/pokemons';
import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import {Pokeballbg, PokemonCard} from '../../components';
import {globalTheme} from '../../../config/theme/global-theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
// import {ThemeContext} from '../../context/ThemeContext';
// import {useContext} from 'react';

export const HomeScreen = () => {
  const {top} = useSafeAreaInsets();
  // const {isDark} = useContext(ThemeContext);
  //  forma tradicional de una peticion http
  // const {isLoading, data: pokemons = []} = useQuery({
  //   queryKey: ['pokemons'],
  //   queryFn: () => getPokemons(0),
  //   staleTime: 1000 * 60 * 60, // 60 minutos
  // });

  const {isLoading, data, fetchNextPage} = useInfiniteQuery({
    queryKey: ['pokemons', 'infinite'],
    initialPageParam: 0,
    queryFn: params => getPokemons(params.pageParam),
    getNextPageParam: (lastPage, pages) => pages.length,
    staleTime: 1000 * 60 * 60, // 60 minutos
  });

  return (
    <View style={globalTheme.globalMargin}>
      <Pokeballbg style={styles.imgPosition} />
      <FlatList
        showsVerticalScrollIndicator={false}
        data={data?.pages.flat() ?? []}
        keyExtractor={(pokemon, index) => `${pokemon.id}-${index}`}
        numColumns={2}
        ListHeaderComponent={() => (
          <Text
            variant="displayMedium"
            // style={{color: isDark ? 'white' : ''}}
          >
            Pokédex
          </Text>
        )}
        style={{paddingTop: top + 20}}
        renderItem={({item}) => <PokemonCard pokemon={item} />}
        onEndReachedThreshold={0.6}
        onEndReached={() => fetchNextPage()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  imgPosition: {
    position: 'absolute',
    top: -70,
    right: -70,
  },
});
