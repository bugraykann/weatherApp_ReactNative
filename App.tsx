import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  ImageBackground,
  ActivityIndicator,
  View,
  Alert,
  ScrollView,
  Dimensions,
  Image,
  DrawerLayoutAndroid,
} from 'react-native';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

interface WeatherData {
  name: string;
  sys: { country: string };
  weather: { main: string }[];
  main: { temp: number; temp_min: number; temp_max: number };
}

interface ForecastData {
  list: {
    dt: number;
    main: { temp: number; temp_min: number; temp_max: number };
    weather: { main: string; icon: string }[]; // Eklenmiş
  }[];
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  image: {
    width: width,
    height: height,
  },
  infoView: {
    flex: 3,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 50, 
  },
  loadingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cityCountryText: {
    color: '#000',
    fontSize: 40,
    fontWeight: 'bold',
  },
  dateText: {
    color: '#000',
    fontSize: 22,
    marginVertical: 10,
  },
  tempText: {
    fontSize: 45,
    color: '#000',
    marginVertical: 10,
  },
  minMaxText: {
    fontSize: 22,
    color: '#000',
    marginVertical: 10,
    fontWeight: '500',
  },
  forecastContainer: {
    padding: 20,
    borderRadius: 20,
    flex: 2,
    marginVertical: 0, 
    marginHorizontal: 15,
    marginTop: 0, 
  },
  forecastCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 3, 
    marginBottom: 15,
  },
  forecastDay: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  forecastTemp: {
    fontSize: 18,
  },
  icon: {
    width: 50,
    height: 50,
  },
});

const cities = ['Istanbul', 'London', 'Paris', 'Tokyo', 'New York', 'Berlin'];

const getBackgroundImage = (weatherMain: string) => {
  switch (weatherMain) {
    case 'Clear':
      return require('./assets/sunny.jpg');
    case 'Clouds':
      return require('./assets/cloudy.jpg');
    case 'Rain':
    case 'Drizzle':
      return require('./assets/rainy.jpg');
    case 'Thunderstorm':
      return require('./assets/storm.jpg');
    case 'Snow':
      return require('./assets/snow.jpg');
    case 'Mist':
    case 'Fog':
      return require('./assets/foggy.jpg');
    default:
      return require('./assets/default.jpg');
  }
};

const getDayName = (dateString: string | number | Date) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { weekday: 'long' }; 
  return new Intl.DateTimeFormat('tr-TR', options).format(date); 
};

const App = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);

  const api = {
    key: '0b1064916d56d6abaf4839a828cc8efc',
    baseUrl: 'https://api.openweathermap.org/data/2.5/',
  };

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      const promises = cities.map(city =>
        axios.get(`${api.baseUrl}weather?q=${city}&appid=${api.key}&units=metric`)
      );
      const results = await Promise.all(promises);
      const data: WeatherData[] = results.map(res => res.data);
      setWeatherData(data);
      const forecastPromises = cities.map(city =>
        axios.get(`${api.baseUrl}forecast?q=${city}&appid=${api.key}&units=metric`)
      );
      const forecastResults = await Promise.all(forecastPromises);
      const forecastData: ForecastData[] = forecastResults.map(res => res.data);
      setForecastData(forecastData);
    } catch (e) {
      console.error('Something went wrong: ' + e);
      Alert.alert("Hata", "Veri alınırken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const renderForecast = (data: ForecastData) => {
    return (
      <ScrollView  showsHorizontalScrollIndicator={false} >
        {data.list
          .filter((_, index) => index % 8 === 0) 
          .map((forecast, index) => (
            <View key={index} style={styles.forecastCard}>
              <Text style={styles.forecastDay}>
                {getDayName(forecast.dt * 1000)}
              </Text>
              <Text style={styles.forecastTemp}>
                {`${Math.round(forecast.main.temp)} °C`}
              </Text>
              <Image
                style={styles.icon}
                source={{ uri: `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png` }} 
              />
            </View>
          ))}
      </ScrollView>
    );
  };
  return (
    <View style={styles.root}>
      <View style={styles.loadingView}>
        <ScrollView horizontal pagingEnabled alwaysBounceHorizontal= {true} decelerationRate = {'normal'}>
          {loading && (
            <View style={styles.infoView}>
              <ActivityIndicator size={'large'} color="#000" />
            </View>
          )}

          {!loading && weatherData.length > 0 && weatherData.map((data, index) => (
            <ImageBackground
              key={index}
              source={getBackgroundImage(data.weather[0].main)}
              resizeMode="cover"
              style={styles.image}
            >
              <View style={styles.infoView}>
                <Text style={styles.cityCountryText}>
                  {`${data?.name}, ${data?.sys?.country}`}
                </Text>
                <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
                <Text style={styles.tempText}>{`${Math.round(data?.main?.temp)} °C`}</Text>
                <Text style={styles.minMaxText}>
                  {`Min ${Math.round(data?.main?.temp_min)} °C / Max ${Math.round(data?.main?.temp_max)} °C`}
                </Text>
              </View>
              <View style={styles.forecastContainer}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>5 Günlük Hava Tahmini</Text>
                {renderForecast(forecastData[index])}
              </View>
            </ImageBackground>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default App;