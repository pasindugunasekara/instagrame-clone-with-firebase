/* eslint-disable prettier/prettier */
/* eslint-disable eol-last */
/* eslint-disable prettier/prettier */
/* eslint-disable semi */
/* eslint-disable quotes */
/* eslint-disable no-floating-decimal */
/* eslint-disable comma-dangle */
/* eslint-disable prettier/prettier */
import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {colors, dimensions} from "../configurations/constants";

const Loader = ({isLoading}) => (
    isLoading ?
        <View style={styles.container}>
            <ActivityIndicator size={'large'} color={colors.fbBlue}/>
        </View> : null
)

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgb(255,255,255)',
        opacity: .8,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        width: dimensions.fullWidth,
        height: dimensions.fullHeight,
        elevation: 20
    }
})

export default Loader