import { SafeAreaView, Text, Image, StyleSheet, View, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import Animated, { FadeInRight, FadeOutRight, FadeInUp, FadeOutUp } from 'react-native-reanimated'
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline'
import { CalendarDaysIcon, MapPinIcon } from 'react-native-heroicons/solid'
import { debounce } from 'lodash'
import { fetchLocation, fetchWeatherForecast } from '../lib/weather'
import { weatherImages } from '../constant'
import * as Progress from 'react-native-progress'
import { storeData, getData } from '../utils/asyncStorage'

export default function HomeScreen() {
    const [showSearch, setShowSearch] = useState(false)
    const [locations, setLocations] = useState([])
    const [weather, setWeather] = useState({})
    const [loading, setLoading] = useState(true)

    const handleLocation = (loc) => {
        setLocations([])
        setShowSearch(false)
        setLoading(true)
        fetchWeatherForecast({
            cityName: loc.name,
            days: '7'
        }).then(data => {
            setWeather(data)
            setLoading(false)
            storeData('city', loc.name)
        })
    }

    const handleSearch = value => {
        fetchLocation({ cityName: value }).then(data => {
            setLocations(data)

        })
    }

    const fetchMyWeatherData = async () => {
        let myCity = await getData('city')
        let cityName = 'Astana'
        if (myCity) cityName = myCity
        fetchWeatherForecast({
            cityName,
            days: '7'
        }).then(data => {
            setWeather(data)
            setLoading(false)
        })
    }

    useEffect(() => {
        fetchMyWeatherData()
    }, [])

    const handleTextDebounce = useCallback(debounce(handleSearch, 1200), [])

    const { current, location } = weather
    return (
        <View style={styles.container}>
            <StatusBar style={styles.statusBar} />
            <Image style={styles.background} source={require('../assets/images/bg.png')} blurRadius={70} />
            {
                loading ? (
                    <View style={styles.loading}>
                        <Progress.CircleSnail thickness={10} size={250} color={'#0d3339'} />
                    </View>
                ) : (
                    <SafeAreaView style={styles.safeArea}>
                        <View style={styles.searchBar} >
                            <View style={[styles.serchArea, {
                                backgroundColor: showSearch ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                                justifyContent: showSearch ? 'space-between' : 'flex-end',
                            }]}>
                                {
                                    showSearch ? (
                                        <Animated.View
                                            entering={FadeInRight.duration(400)}
                                            exiting={FadeOutRight.duration(200)}

                                        >
                                            <TextInput
                                                onChangeText={handleTextDebounce}
                                                style={styles.searchInput}
                                                placeholder='Search City'
                                                placeholderTextColor={'lightgray'}
                                            ></TextInput>
                                        </Animated.View>
                                    ) : null
                                }
                                <TouchableOpacity
                                    onPress={() => setShowSearch(!showSearch)}
                                    style={styles.button}
                                >
                                    <MagnifyingGlassIcon size={25} color={'white'} />
                                </TouchableOpacity>
                            </View>
                            {
                                locations?.length > 0 && showSearch ? (
                                    <Animated.View
                                        entering={FadeInUp.duration(500)}
                                        exiting={FadeOutUp}
                                        style={styles.locationSection}>
                                        {
                                            locations.map((loc, index) => {
                                                let showBorder = index + 1 != locations?.length
                                                let borderClass = showBorder ? 1 : null
                                                return (
                                                    <TouchableOpacity
                                                        key={index}
                                                        onPress={() => handleLocation(loc)}
                                                        style={[styles.city, {
                                                            borderBottomWidth: borderClass,
                                                        }]}
                                                    >
                                                        <MapPinIcon size={20} color={'gray'} />
                                                        <Text style={styles.searchCityName}>{loc?.name}, {loc?.country}</Text>
                                                    </TouchableOpacity>
                                                )
                                            })
                                        }
                                    </Animated.View>
                                ) : null
                            }
                        </View>
                        <View style={styles.locationCard}>
                            <Text style={styles.locationTitle}>{location?.name},
                                <Text style={styles.locationSubTitle}>
                                    {' ' + location?.country}
                                </Text>
                            </Text>
                            <View style={styles.locationWeather}>
                                <Image
                                    style={{ height: 250, width: 250 }}
                                    source={weatherImages[current?.condition?.text]}
                                />
                            </View>
                            <View style={styles.weatherValue}>
                                <Text style={styles.weatherDegree}>
                                    {current?.temp_c}°C
                                </Text>
                                <Text style={styles.weatherType}>
                                    {current?.condition?.text}
                                </Text>
                            </View>
                            <View style={styles.otherStats}>
                                <View style={styles.statsIcon}>
                                    <Image
                                        style={{ height: 24, width: 24 }}
                                        source={require('../assets/icons/wind.png')}
                                    />
                                    <Text style={{ color: 'white', fontWeight: '400', fontSize: 20 }} >{current?.wind_kph}km/h</Text>
                                </View>
                                <View style={styles.statsIcon}>
                                    <Image
                                        style={{ height: 24, width: 24 }}
                                        source={require('../assets/icons/drop.png')}
                                    />
                                    <Text style={{ color: 'white', fontWeight: '400', fontSize: 20 }} >{current?.humidity}%</Text>
                                </View>
                                <View style={styles.statsIcon}>
                                    <Image
                                        style={{ height: 24, width: 24 }}
                                        source={require('../assets/icons/sun.png')}
                                    />
                                    <Text style={{ color: 'white', fontWeight: '400', fontSize: 20 }} >{weather?.forecast?.forecastday[0]?.astro?.sunrise}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.nextWetherList}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, rowGap: '6' }}>
                                <CalendarDaysIcon size={22} color={'white'} />
                                <Text style={{ color: 'white', marginLeft: 10 }} >Daily forecast</Text>
                            </View>
                            <ScrollView
                                horizontal
                                contentContainerStyle={{ paddingHorizontal: 15, marginTop: 15 }}
                                showsHorizontalScrollIndicator={false}
                            >
                                {
                                    weather?.forecast?.forecastday?.map((item, index) => {
                                        let date = new Date(item.date)
                                        let options = { weekday: 'long' }
                                        let dayName = date.toLocaleDateString('ru-RU', options)
                                        dayName = dayName.split(',')[0]
                                        return (
                                            <View
                                                key={index}
                                                style={[styles.nextDayCard, { backgroundColor: 'rgba(255,255,255,0.15)' }]} >
                                                <Image
                                                    source={weatherImages[item?.day?.condition?.text]}
                                                    style={{ height: 35, width: 35 }}
                                                />
                                                <Text style={{ color: 'white' }} >{dayName}</Text>
                                                <Text style={{ color: 'white', fontSize: 24, fontWeight: '500' }}>{item?.day?.avgtemp_c}°C</Text>
                                            </View>
                                        )
                                    })
                                }
                            </ScrollView>
                        </View>
                    </SafeAreaView>
                )
            }
        </View >
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative'
    },
    loading: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    statusBar: {
        backgroundColor: 'rgba(255,255,255,0.6)'
    },
    background: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    safeArea: {
        flex: 1,
    },
    searchBar: {
        height: '7%',
        position: "relative",
        marginHorizontal: 20,
        zIndex: '50'
    },
    serchArea: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 999,
    },
    searchInput: {
        width: 300,
        paddingLeft: 16,
        height: 40,
        color: 'white',
        fontSize: 24
    },
    button: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 999,
        padding: 9,
        margin: 3,
    },
    locationSection: {
        position: 'absolute',
        width: '100%',
        backgroundColor: 'rgb(210,210,210)',
        marginTop: 60,
        borderRadius: 15
    },
    city: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: 'gray',
        padding: 9,
        paddingHorizontal: 12,
        height: 40
    },
    searchCityName: {
        color: 'black',
        fontSize: 24,
        marginLeft: 6
    },
    locationCard: {
        marginHorizontal: 12,
        justifyContent: 'space-around',
        flex: 1,
        marginBottom: 6
    },
    locationTitle: {
        color: 'white',
        textAlign: 'center',
        fontSize: 32,
        fontWeight: '500'
    },
    locationSubTitle: {
        fontSize: 24,
        color: 'rgb(230,230,230)',
        fontWeight: '400'
    },
    locationWeather: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    weatherValue: {
        gap: 20
    },
    weatherDegree: {
        textAlign: 'center',
        fontWeight: '600',
        color: 'white',
        fontSize: 64,
    },
    weatherType: {
        textAlign: 'center',
        fontSize: 32,
        color: 'white',

    },
    otherStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 12
    },
    statsIcon: {
        flexDirection: "row",
        gap: 6,
        alignItems: 'center'
    },
    nextWetherList: {
        marginBottom: 6,
        columnGap: 9
    },
    nextDayCard: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 92,
        borderRadius: 22,
        paddingVertical: 9,
        columnGap: 3,
        marginRight: 25
    }
})