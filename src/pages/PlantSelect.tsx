import React, { useEffect, useState } from 'react'
import { Text, View, StyleSheet, FlatList, ActivityIndicator } from 'react-native'

import colors from '../styles/colors'
import {Header} from '../components/Header'
import fonts from '../styles/fonts'
import { EnviromentButton } from '../components/EnviromentButton'
import {Load} from '../components/Load'

import { PlantProps } from '../libs/storage'
import api from '../services/api'
import { PlantCardPrimery } from '../components/PlantCardPrimary'
import { useNavigation } from '@react-navigation/core'

interface EnviromentProps {
  key: string;
  title: string;
}

export function PlantSelect() {
  const [enviroments, setEnviroments] = useState<EnviromentProps[]>([]);
  const [plants, setPlants] = useState<PlantProps[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<PlantProps[]>([]);
  const [enviromentSelected, setEnviromentSelected] = useState('all');
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    async function fetchEnviroment() {
      const {data} = await api
      .get('plants_environments?_sort=title&_order=asc');
      setEnviroments([
        {
          key: 'all',
          title: 'Todos'
        },
        ...data
      ]);
    }

    fetchEnviroment();
  }, []);

  useEffect(() => {
    fetchPlants();
  }, []);

  async function fetchPlants() {
    const {data} = await api.get(`plants?_sort=name&_order=asc&_page=${page}&_limit=8`);
    
    if (!data)
      return setLoading(true);

    if (page>1){
      setPlants(oldValue => [...oldValue, ...data]);
      setFilteredPlants(oldValue => [...oldValue, ...data]);
    } else {
      setPlants(data);
      setFilteredPlants(data);
    }
    
    setLoading(false);
    setLoadingMore(false);
  }

  function handleEnviromentSelected(enviroment: string) {
    setEnviromentSelected(enviroment);

    if ( enviroment === 'all' )
      return setFilteredPlants(plants);

    const filtered = plants.filter(plant => 
      plant.environments.includes(enviroment)
    );

    setFilteredPlants(filtered);
  }

  function handleFetchMore(distance: number) {
    if (distance < 1) 
      return;
    
    setLoadingMore(true);
    setPage(oldValue => oldValue + 1);
    fetchPlants();
  }

  function handlePlantSelect(plant: PlantProps) {
    navigation.navigate("PlantSave", {plant});
  }

  if (loading)
    return <Load />

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header></Header>
        <Text style={styles.title}>Em qual hambiente</Text>
        <Text style={styles.subtitle}>você quer colocar sua planta?</Text>
      </View>
      <View>
        <FlatList 
          data={enviroments} 
          keyExtractor={(item) => String(item.key)}
          renderItem={({item,index}) => (
            <EnviromentButton 
              title={item.title} 
              key={`${index}`} 
              active={item.key === enviromentSelected}
              onPress={() => handleEnviromentSelected(item.key)}/>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.enviromentList}
        />
      </View>

      <View style={styles.plants}>
        <FlatList
          data={filteredPlants}
          keyExtractor={(item) => String(item.id)}
          renderItem={({item, index}) => (
            <PlantCardPrimery 
              data={item} 
              onPress={()=>handlePlantSelect(item)}
              />
          )}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          contentContainerStyle={styles.plantsList}
          onEndReachedThreshold={0.1}
          onEndReached={({distanceFromEnd}) => handleFetchMore(distanceFromEnd)}
          ListFooterComponent={
            loadingMore 
            ? <ActivityIndicator color={colors.green} />
            : <React.Fragment/>
          }
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 17,
    color: colors.heading,
    fontFamily: fonts.heading,
    lineHeight: 20,
    marginTop: 15,
  },
  subtitle: {
    fontSize: 17,
    color: colors.heading,
    fontFamily: fonts.text,
    lineHeight: 20,
  },
  enviromentList: {
    height: 40,
    justifyContent: 'center',
    paddingBottom: 5,
    marginLeft: 30,
    marginVertical: 32,
  },
  plants: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    marginLeft: -10,
    marginRight: -10,
  },
  plantsList: {
    
  }
})