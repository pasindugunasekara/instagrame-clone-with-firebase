/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable keyword-spacing */
/* eslint-disable eqeqeq */
/* eslint-disable quotes */
/* eslint-disable semi */
/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
import {Button, Center, Input, Text} from 'native-base';
import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import EmptyView from '../../components/EmptyView';
import {colors, dimensions, fontFamilies} from '../../configurations/constants';
import {GoogleSignin, GoogleSigninButton} from '@react-native-google-signin/google-signin';
import * as EmailValidator from 'email-validator';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Loader from '../../components/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';


const LoginScreen = ({navigation}) => {

    const [loggedIn, setloggedIn] = React.useState(false);
    const [googleLoader, setGoogleLoader] = React.useState(false);
    const [userInfo, setuserInfo] = React.useState([]);

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');


    React.useEffect(() => {
        GoogleSignin.configure({
            webClientId:
              '483072385484-3ojb6bgr3l0urmk8e73c2e779h0h25dn.apps.googleusercontent.com',
          });
    }, []);

    /* ASYNCSTORAGE */
    const storeData = async (value) => {
        try {
          await AsyncStorage.removeItem('USERDATA')
          await AsyncStorage.setItem('USERDATA', JSON.stringify(value))
        } catch (e) {
          // saving error
        }
      }

      const getData = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem('USERDATA')
          return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch(e) {
          // error reading value
          console.warn( "AYNCSTORAGE: [GET] ERROR: ",e);
        }
      }

    /* EMAIL/PASSWORD: login function */
    const EmailPasswordLoginSignOutHandler = async () => {
        setGoogleLoader(true)
        // email validator
        if (EmailValidator.validate(email) && password != '' && password.length > 5) {
            
            auth()
            .createUserWithEmailAndPassword(email, "firebaseDefaultPassword!")
            .then((createuser) => {
                //TODO: auth/email-not-use
                console.log("RESULT: ", createuser)
                setGoogleLoader(false)

                alert("Sign up, ypu don't have an account.")


                const {displayName, password, phoneNumber, photoURL, email, uid} = createuser.user;
               
                    //ASYNCSTORAGE: store data
                    storeData( {
                        uid: createuser.user.uid,
                        displayName: userDetails.fullName,
                        email: userDetails.email,
                        photoURL: null,
                        base64String: userDetails?.base64String,
                        base64Type: userDetails?.base64Type,
                        password: userDetails.password,
                    })
                    // console.log("ASYNCSTORAGE: USERDATA: ",  {
                    //     uid: createuser.user.uid,
                    //     displayName: userDetails.fullName,
                    //     email: userDetails.email,
                    //     photoURL: null,
                    //     base64String: userDetails?.base64String,
                    //     base64Type: userDetails?.base64Type,
                    //     password: userDetails.password,
                    // });



                // auth()
                // .signOut()
                // .then(() => console.log('User signed out!'));
            })
            .catch(error => {
                if (error.code === 'auth/email-already-in-use') {
                console.log('That email address is already in use!');
                //TODO: auth/email-already-in-use

                   
                firestore()
                .collection('Users')
                .get()
                .then(result => {
                    result.forEach(data => {
                        console.log(data._data);
                        if(data._data.email === email) {
                            if(data._data.password === password) {
                                setGoogleLoader(false)

                                //Asyncstorage: store-data
                                storeData(data._data)
                                navigation.navigate('Tab');
                            }
                            else {
                                alert("Password is incorrect.")
                                setGoogleLoader(false)
                            }
                            return;
                        }
                    })
                })
                }
    
                if (error.code === 'auth/invalid-email') {
                console.log('That email address is invalid!');
                setGoogleLoader(false)
                }
                
                console.warn(error);
            });
        } else {
            setGoogleLoader(false)
            alert("'That email address is invalid or Password should be atleast 6 characters.")
        }
    }


    /* GOOGLE: login function */
    const GoogleSignInOutHandler = async (props) => {
        setGoogleLoader(true)
        try{
            // Get the users ID token
        const {idToken, user} = await GoogleSignin.signIn();

        // Create a Google credential with the token
        const googleCredential =await auth.GoogleAuthProvider.credential(idToken);

        // Sign-in the user with the credential
        const credential =await auth()
        .signInWithCredential(googleCredential)
        .then(creteUser => {
            setGoogleLoader(false)
            const {displayName, email, uid, photoURL } = creteUser.user;
            
            firestore()
            .collection('Users')
            .doc(uid)
            .get()
            .then(doc => {
                if ( doc?.exists) {
                        console.log('Document data:', doc?.data());

                        if(props?.isSignIn) {
                            //TODO: do somethings with sign-in
                            console.log("GOOGLE: sign-in successfully");
                            setloggedIn(true)
                            
                            const {displayName, password, phoneNumber, photoURL, email, uid} = doc?.data()
                            //ASYNCSTORAGE: store data
                            storeData({
                                uid: uid,
                                displayName: displayName,
                                email: email,
                                photoURL: photoURL,
                                password: password,
                                base64String:null,
                                base64Type: null,
                            })
                            // console.log("ASYNCSTORAGE: USERDATA: ", {
                            //     uid: uid,
                            //     displayName: displayName,
                            //     email: email,
                            //     photoURL: photoURL,
                            //     password: null,
                            // });

                            navigation.navigate('Tab');
                        }
                        
                           
                    } else {
                         //// doc.data() will be undefined in this case
                        console.log('No such document!');
                        alert("Sign up, you don't have an account!")
                        if (!props?.isSignIn) {
                         //TODO: do somethings with sign-up
                        
                            //firestore: save new user
                            firestore()
                            .collection('Users')
                            .add({
                                uid: uid,
                                displayName: displayName,
                                email: email,
                                photoURL: photoURL,
                                password: null,
                            })
                            .then(() => {
                                console.log("GOOGLE: sign-up successfully");
                                setloggedIn(true)
                            })
                            .catch(error => console.log("ERROR: User not added!"));
                            
                        }
                    }
                  
                });
        });

        // GOOGLE: sign out: Temperary
        await GoogleSignin.signOut();

        } catch(error) {
            console.log("SIGNIN ERROR: ", error);
            setGoogleLoader(false)
        }
    }





    return (
    <>
        <Loader isLoading={googleLoader}/>
       <Center flex={1} style={styles?.container}>
        {/* header: logo name */}
        <Text fontSize="5xl" style={styles?.textLogo}>Inxtagram</Text>

        <EmptyView style={{marginTop: dimensions.heightLevel1}}/>
        {/* section: input fields */}
       <Input
            w="90%"
            mx={3}
            placeholder="Username"
            value={email}
            onChangeText={(data) => setEmail(data)}
            _light={{
                placeholderTextColor: "blueGray.400",
            }}
            _dark={{
                placeholderTextColor: "blueGray.50",
            }}
        />

        <EmptyView style={{marginTop: dimensions.heightLevel1}}/>

        <Input
            w="90%"
            mx={3}
            secureTextEntry
            value={password}
            onChangeText={(data) => setPassword(data)}
            placeholder="Password"
            _light={{
                placeholderTextColor: "blueGray.400",
            }}
            _dark={{
                placeholderTextColor: "blueGray.50",
            }}
        />

        <EmptyView style={{marginTop: dimensions.heightLevel1}}/>

        {/* button: default login button */}
        <Button
            w="90%"
            isDisabled={false}
            style={styles?.button}
            onPress={() => EmailPasswordLoginSignOutHandler()}
        >
          Log in
        </Button>

        <EmptyView style={{marginTop: dimensions.heightLevel1}}/>

        {/* section: forgot text */}
        <Text fontSize="sm">Forgotten your login details? Get help with logging in.</Text>

        <EmptyView style={{marginTop: dimensions.heightLevel1}}/>

        {/* section: horizontal line with text */}
        <View style={styles?.hrLine}>
            <Text fontSize="sm" style={styles?.hrText}>OR</Text>
        </View>

        <EmptyView style={{marginTop: dimensions.heightLevel1}}/>

        {/* button: google login button */}
        <Center style={styles.body}>
            <View style={styles.sectionContainer}>
            <GoogleSigninButton
                style={{width: 250, height: 48}}
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={() => GoogleSignInOutHandler({isSignIn: true})}
            />
            </View>
            <View style={styles.buttonContainer}>
            {!loggedIn && <Text>You are currently logged out</Text>}
            </View>
        </Center>


        {/* footer: sign up */}
        <View style={styles?.footer}>
            <Text fontSize="sm">Don't have an account? </Text>
            <TouchableOpacity
             onPress={() => navigation.navigate('SignUp')}
            >
                <Text fontSize="sm" style={{color: colors?.blue}}>Sign up.</Text>
            </TouchableOpacity>
        </View>

      </Center>
      </>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors?.white,
    },

    textLogo: {
        fontFamily: fontFamilies?.blackBerry,
        color: colors?.black,
    },

    button: {
        backgroundColor: colors?.fbBlue,
    },

    hrLine: {
        borderBottomWidth: 1,
        borderBottomColor: colors?.black50,
        width: '90%',
    },

    hrText: {
        position: 'absolute',
        top: -12,
        alignSelf: 'center',
        backgroundColor: colors?.white,
        paddingHorizontal: dimensions?.paddingLevel1,
        color: colors?.black50,
    },

    footer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        paddingVertical: dimensions?.paddingLevel1,
        backgroundColor: colors?.white,
        width: "100%",
        borderTopWidth: 1,
        borderTopColor: colors?.black50,
        justifyContent: 'center',
    }
});

export default LoginScreen;