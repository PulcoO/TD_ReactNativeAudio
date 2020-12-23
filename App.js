import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet,TouchableOpacity, Text, View, Button, Image, ImageBackground } from 'react-native';
import { Audio } from 'expo-av';

//import the data
import audioBookPlaylist from './Data/audio.data';

export default class App extends React.Component {

  //-------Props

  //-------State
  state = {
    isPlaying: false,
    playbackInstance: null,
    currentIndex: 0,
  }

  //-------Method
  async componentDidMount() {
    try {
      console.log('je pass bien par la');
      this.loadAudio()
    } catch (e) {
      console.log(e)
    }
  }

  //-----Methode afin de 
  async loadAudio() {
    const {currentIndex, isPlaying} = this.state
  
    try {
      //permet d'instancier un nouvel objet Audio Sound qui prend en source 
      const playbackInstance = new Audio.Sound();
      const source = {
        uri: audioBookPlaylist[currentIndex].uri
      }
      
      //ultra important pour repartir sur la lecture du tract lorsqu'on change de track !
      const status = {
        // unformation potentiellement imporrtant aussi le volume peux y être placer !
        shouldPlay: isPlaying,
      }
  
      playbackInstance.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate)    
      //on load véritablement la source de la musique dans l'objet Audio Sound : playbackInstance 
      // =====> 1 param : la source
      // =====> 2 param : Le status de l'objet : définis par les propriétés shouldPlay et Volume . shoudplay défini lui même par isPlaying
      // =====> 3 param : Indique si la méthode loadAsync doit ou non télécharger les musiques avant de les lire. ( voir doc )
      await playbackInstance.loadAsync(source, status, false)
      // change le state de playBackInstance => afin de le rendre unique en fonction du currentIndex de sa source 
      this.setState({playbackInstance})
      } catch (e) {
        console.log(e)
      }
  }
  
  onPlaybackStatusUpdate = status => {
    this.setState({
      isBuffering: status.isBuffering
    })
  }

  handlePlayPause = async () => {
    //va chercher la derniére source a jour du state
    const { isPlaying, playbackInstance } = this.state
    // check is playing ==> utilisation du pause ou plau async https://docs.expo.io/versions/latest/sdk/audio/#audiosetaudiomodeasyncmode
    isPlaying ? await playbackInstance.pauseAsync() : await playbackInstance.playAsync()
    //change bien le state : play (true) / pause (false)
    this.setState({
      isPlaying: !isPlaying
    })
  }

  handlePreviousTrack = async () => {
    let { playbackInstance, currentIndex, isPlaying } = this.state
    if (playbackInstance) {
      await playbackInstance.unloadAsync()
      currentIndex < audioBookPlaylist.length - 1 ? (currentIndex -= 1) : (currentIndex = 0)
      // on change le state afin de pouvoir reload after
      this.setState({
        currentIndex
      })
      // on reload => ce qui va recreer un nouvel object Audio mais avec une source différente puisque l'index a été modifier
      this.loadAudio()
    }
  }

  handleNextTrack = async () => {
    let { playbackInstance, currentIndex, isPlaying } = this.state
    //console.log(playbackInstance)
    //console.log(currentIndex)
    if (playbackInstance) {
      await playbackInstance.unloadAsync()
      currentIndex < audioBookPlaylist.length - 1 ? (currentIndex += 1) : (currentIndex = 0)
      this.setState({
        currentIndex
      })
      //console.log(currentIndex)
      this.loadAudio()
    }
  }



  //--------Render
  render() {
    return (
      <View style={styles.container}>

        <Image style={styles.albumCover} 
              source={{ uri: 'http://www.archive.org/download/LibrivoxCdCoverArt8/hamlet_1104.jpg' }}/>

        <View style={styles.controls}>

            <TouchableOpacity style={styles.control} onPress={this.handlePreviousTrack}>
              <Ionicons name='caret-back-outline' size={48} color='#444' />
            </TouchableOpacity>

            <TouchableOpacity style={styles.control} onPress={this.handlePlayPause}>
              {this.state.isPlaying ? (
                <Ionicons name='pause-circle-outline' size={48} color='#444' />
              ) : (
                <Ionicons name='caret-forward-circle-outline' size={48} color='#444' />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.control} onPress={this.handleNextTrack}>
              <Ionicons name='caret-forward-outline' size={48} color='#444' />
            </TouchableOpacity>

        </View>

      </View>
    )
  }
}

// ------------ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  albumCover: {
    width: 250,
    height: 250
  },
  controls: {
    flexDirection: 'row'
  },
  control: {
    margin: 20
  }
})