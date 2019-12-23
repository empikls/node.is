#!groovy



def label = "jenkins"
env.DOCKERHUB_IMAGE = "devops53/hello-world"


podTemplate(label: label, yaml: """
apiVersion: v1
kind: Pod
metadata:
  name: jenkins-slave
  namespace: jenkins
  labels:
    component: ci
    jenkins: jenkins-agent
spec:
  # Use service account that can deploy to all namespaces
  serviceAccountName: jenkins
  volumes:
  - name: dind-storage
    emptyDir: {}
  containers:
  - name: git
    image: alpine/git
    command:
    - cat
    tty: true
  - name: nodejs
    image: node:latest
    command:
    - cat
    tty: true
  - name: kubectl
    image: bitnami/kubectl:latest
    command:
    - cat
    tty: true
  - name: docker
    image: docker:19-git
    command:
    - cat
    tty: true
    env:
    - name: DOCKER_HOST
      value: tcp://docker-dind:2375
    volumeMounts:
      - name: dind-storage
        mountPath: /var/lib/docker
  - name: helm
    image: lachlanevenson/k8s-helm:latest
    command:
    - cat
    tty: true
"""
  )

  {

  node(label) {
    
    stage('Checkout SCM') {
        checkout scm
    } 

    stage('Build node.js app') {
        container('nodejs') {
        sh 'npm install'
    }
      }
    stage('Node.js test') {
        container('nodejs') {
        sh 'npm test'
    }
      }
    stage('Build docker image') {
        container('docker') {

        if ( isPullRequest() ) {
        print "it's a Pull Request and we don't build app"
      }


      echo "Docker build image name ${DOCKERHUB_IMAGE}:${BRANCH_NAME}"
           sh 'docker build . -t ${DOCKERHUB_IMAGE}:${BRANCH_NAME}'
            }

    }
    stage('Docker push') {
        container('docker') {

       if ( isPullRequest() ) {
        print "it's a Pull Request and we don't push app"
       }
       withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]){
            sh """
             docker login --username ${DOCKER_USER} --password ${DOCKER_PASSWORD}
             docker push ${DOCKERHUB_IMAGE}:${BRANCH_NAME}
            """
            }
          }
        } 
      
       if ( isPushToAnotherBranch() ) {
          print "It's push to another Branch"
    }
    def tagDockerImage
    def nameStage
            if ( isMaster() ) {
               stage('Deploy dev version') {
                    tagDockerImage = env.BRANCH_NAME
                    nameStage = "dev"
                    container('helm') {
                        deploy( tagDockerImage, nameStage )
                     }
               }
            }
            if ( isChangeSet() ) {
                stage('Deploy to Production')
                        tagDockerImage = "${sh(script:'cat production-release.txt',returnStdout: true)}"
                        nameStage = "prod"
                        container('helm') {
                            deploy( tagDockerImage, nameStage )
                        }
              }
            
            if ( isBuildingTag() ){
                stage('Deploy to QA stage') {
                    tagDockerImage = env.BRANCH_NAME
                    nameStage = "QA"
                    container('kubhelmectl') {
                        deploy( tagDockerImage, nameStage )
                    }
                }   
            }

    def isPullRequest() {
    return (env.BRANCH_NAME ==~  /^PR-\d+$/)
        }
    def isMaster() {
    return (env.BRANCH_NAME == "master" )
        }
    def isBuildingTag() {
    return ( env.BRANCH_NAME ==~ /^v\d.\d.\d$/ )
        }

    def isPushToAnotherBranch() {
    return ( ! isMaster() && ! isBuildingTag() && ! isPullRequest() )
        }
    
    def isChangeSet() {
       def changeLogSets = currentBuild.changeSets
       changeLogSets.each { gitChangeSetList ->
        gitChangeSetList.each { gitChangeSet ->
            gitChangeSet.getAffectedPaths().each { path ->
                if(path.tokenize("/").size() > 1) result.put(path.tokenize("/").first(), true)
            }
        }
      }
    return false
    }

    def deploy( tagName, appName ) {

        echo "Release image: ${DOCKERHUB_IMAGE}:$tagName"
        echo "Deploy app name: $appName"

        withKubeConfig([credentialsId: 'kubeconfig']) {
        sh """
        helm upgrade --install ${appName} \
            --namespace=jenkins \
            --set master.ingress.enabled=true \
            --set-string master.ingress.hostName="https://ibmsuninters2.dns-cloud.net" \
            --set-string master.ingress.annotations."kubernetes.io/tls-acme"=true \
            --set-string master.ingress.annotations."kubernetes.io/ssl-redirect"=true \
            --set-string master.ingress.annotations."kubernetes.io/ingress.class"=nginx \
            --set-string master.ingress.tls[0].hosts[0]="https://ibmsuninters2.dns-cloud.net" \
            --set-string master.ingress.tls[0].secretName=acme-app-tls \
            ${DOCKER_IMAGE_NAME}:${tagName}
        """
        }

}