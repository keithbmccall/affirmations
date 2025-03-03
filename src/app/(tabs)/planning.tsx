import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { RefreshControl } from 'react-native-gesture-handler';

import NamedStyles = StyleSheet.NamedStyles;

const API_KEY = 'TURBOMAX';

export const queryPokemon = async (
  url: string = 'https://pokeapi.co/api/v2/pokemon/ditto',
) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
  });
  return response.json();
};

const limit = 20;
export default function PlanningScreen() {
  const [page, setPage] = useState(1);
  const [pokemon, setPokemon] = useState<never[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  // Form - textinput, select, checkbox, radio
  // GET, POST, PUT, DELETE
  // Get needs to have at least 1 image rendered too
  //
  // Render a list of something for FlatList components using pokemon api
  useEffect(() => {
    const offset = (page - 1) * limit;
    const getPokemon = async () => {
      try {
        const queriedPokemon = await queryPokemon(
          `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`,
        );
        console.log('offset is', offset);
        setPokemon(currentPokemon => {
          return [...currentPokemon, ...queriedPokemon.results];
        });
      } catch (e) {
        console.error(e);
      }
    };
    void getPokemon();
  }, [page]);

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      const queriedPokemon = await queryPokemon(
        `https://pokeapi.co/api/v2/pokemon?limit=${pokemon.length}`,
      );
      setPokemon(queriedPokemon.results);
    } catch (e) {
      console.error(e);
    }

    setRefreshing(false);
  };
  const onEndReached = () => {
    setPage(page => page + 1);
  };
  return (
    <SafeAreaView>
      {pokemon.length ? (
        <FlatList
          data={pokemon}
          ListHeaderComponent={
            <View>
              <Text style={styles.title}>Pokemon</Text>
            </View>
          }
          keyExtractor={item => item.name}
          onEndReached={onEndReached}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => {
            return (
              <View>
                <Text style={styles.itemText}>{item.name}</Text>
                <Text style={styles.itemText}>{item.url}</Text>
                <Image
                  source={{
                    uri: 'https://images.pluto.tv/channels/6675c7868768aa0008d7f1c7/featuredImage.jpg',
                  }}
                  resizeMode="contain"
                  style={styles.image}
                />
                <FastImage
                  style={styles.image}
                  source={{
                    uri: 'https://images.pluto.tv/channels/6675c7868768aa0008d7f1c7/featuredImage.jpg',
                    priority: FastImage.priority.normal,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </View>
            );
          }}
          contentContainerStyle={styles.contentContainerStyle}
        />
      ) : null}
    </SafeAreaView>
  );
}

const positioning: Record<string, NamedStyles> = {
  absolute: {
    position: 'absolute',
  },
  relative: {
    position: 'relative',
  },
};

const colors = {
  white: '#ffffff',
  black: '#000000',
  grey: '#808080',
  darkGrey: '#232425',
};

const styles = StyleSheet.create({
  headerImage: {
    color: colors.grey,
    bottom: -90,
    left: -35,
    ...positioning.absolute,
  },
  title: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.darkGrey,
  },
  itemText: {
    fontSize: 12,
    lineHeight: 24,
    color: colors.darkGrey,
  },
  image: { width: 150, height: 100 },
  contentContainerStyle: { alignItems: 'center' },
});
