pipeline {
    agent any

    environment {
        // غيّر القيم دي حسب حسابك
        DOCKERHUB_USER = 'mogamalfawzy'
        IMAGE_NAME     = "${DOCKERHUB_USER}/demo-app"
        IMAGE_TAG      = "${env.BUILD_NUMBER}"
        // Credentials IDs لازم تتعمل في Jenkins (Manage Jenkins > Credentials)
        DOCKERHUB_CREDS = 'dockerhub-creds'   // Username with password
        //KUBECONFIG_CREDS = 'kubeconfig'       // Secret file
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
                sh 'npm ci'
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
            when { branch 'main' }
            steps {
                withCredentials([file(credentialsId: env.KUBECONFIG_CREDS, variable: 'KUBECONFIG')]) {
                    sh '''
                        sed -i "s|image: .*|image: ${IMAGE_NAME}:${IMAGE_TAG}|" k8s/deployment.yaml
                        kubectl apply -f k8s/deployment.yaml
                        kubectl apply -f k8s/service.yaml
                        kubectl apply -f k8s/hpa.yaml
                        kubectl rollout status deployment/demo-app --timeout=120s
                    '''
                }
            }
        }
    }

    post {
        success { echo "Deployed ${IMAGE_NAME}:${IMAGE_TAG} successfully" }
        failure { echo 'Pipeline failed' }
        always  { sh "docker rmi ${IMAGE_NAME}:${IMAGE_TAG} || true" }
    }
}
