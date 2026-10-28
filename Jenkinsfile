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
        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh """
                        echo "Updating deployment.yaml with image tag: ${IMAGE_TAG}"
                        sed -i "s|image: ${IMAGE_NAME}:.*|image: ${IMAGE_NAME}:${IMAGE_TAG}|g" deployment.yaml
                        
                        echo "Applying Kubernetes manifests to k3d cluster..."
                        kubectl apply -f deployment.yaml --validate=false
                        kubectl apply -f service.yaml --validate=false
                        kubectl apply -f hpa.yaml --validate=false
                        
                        echo "Verifying cluster status and pod distribution..."
                        kubectl get pods -o wide
                        kubectl get svc
                    """
                }
            }
        }
    }
}
