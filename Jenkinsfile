pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'mogamalfawzy'
        IMAGE_NAME     = "${DOCKERHUB_USER}/demo-app"
        IMAGE_TAG      = "v1.${env.BUILD_NUMBER}"
        DOCKERHUB_CREDS = 'dockerhub-creds'   // Username with password
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test') {
            agent {
                docker { image 'node:20-alpine'; reuseNode true }
            }
            steps {
                sh 'npm install'
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Push Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: env.DOCKERHUB_CREDS,
                                                usernameVariable: 'DH_USER',
                                                passwordVariable: 'DH_PASS')]) {
                    sh '''
                        echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
                        docker push ${IMAGE_NAME}:${IMAGE_TAG}
                        docker push ${IMAGE_NAME}:latest
                        docker logout
                    '''
                }
            }
        }
    }
}
