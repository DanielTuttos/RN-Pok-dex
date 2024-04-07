import {FlatList, StyleSheet, View, useWindowDimensions} from 'react-native';
import {ActivityIndicator, FAB, Text, useTheme} from 'react-native-paper';
import {getPokemons} from '../../../actions/pokemons';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {FullScreenLoader, Pokeballbg, PokemonCard} from '../../components';
import {globalTheme} from '../../../config/theme/global-theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParams} from '../../navigator/StackNavigator';

interface Props extends StackScreenProps<RootStackParams, 'HomeScreen'> {}

export const HomeScreen = ({navigation}: Props) => {
  const {top} = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const theme = useTheme();

  const {isLoading, data, fetchNextPage} = useInfiniteQuery({
    queryKey: ['pokemons', 'infinite'],
    initialPageParam: 0,
    queryFn: async params => {
      const pokemons = await getPokemons(params.pageParam);
      pokemons.forEach(pokemon => {
        queryClient.setQueryData(['pokemon', pokemon.id], pokemon);
      });
      return pokemons;
    },
    getNextPageParam: (lastPage, pages) => pages.length,
    staleTime: 1000 * 60 * 60, // 60 minutos
  });

  return (
    <View style={[globalTheme.globalMargin, {flex: 1}]}>
      <Pokeballbg style={styles.imgPosition} />
      {isLoading ? (
        <FullScreenLoader />
      ) : (
        <>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={data?.pages.flat() ?? []}
            keyExtractor={(pokemon, index) => `${pokemon.id}-${index}`}
            numColumns={2}
            ListHeaderComponent={() => (
              <Text
                variant="displayMedium"
                style={{color: theme.dark ? 'white' : 'black'}}>
                Pokédex
              </Text>
            )}
            style={{paddingTop: top + 20}}
            renderItem={({item}) => <PokemonCard pokemon={item} />}
            onEndReachedThreshold={0.6}
            onEndReached={() => fetchNextPage()}
          />
          <FAB
            label="Buscar"
            style={[globalTheme.fab, {backgroundColor: theme.colors.primary}]}
            mode="elevated"
            onPress={() => navigation.push('SearchScreen')}
            color={theme.dark ? 'black' : 'white'}
          />
        </>
      )}
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
