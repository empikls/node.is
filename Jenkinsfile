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
    image: lachlanevenson/k8s-helm:v2.16.1
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
      tagDockerImage = "${sh(script:'cat production-release.txt',returnStdout: true)}"
      container('docker') {
    if ( !isChangeSet() ) {
      echo "Build docker image with tag ${BRANCH_NAME}"
      sh "docker build . -t ${DOCKERHUB_IMAGE}:${BRANCH_NAME}"
    }
        
      }
    }
    stage('Docker push') {
      container('docker') {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]){
          if ( !isChangeSet() ) {
            echo "Push docker image with tag ${BRANCH_NAME}"
            sh """
             docker login --username ${DOCKER_USER} --password ${DOCKER_PASSWORD}
             docker push ${DOCKERHUB_IMAGE}:${BRANCH_NAME}
            """
          }
          if ( isPullRequest() ) {
            return 0
          }
        } 
      } 
    } 
    if ( isPushToAnotherBranch() ) {
          return 0
    }
  
    def tagDockerImage
    def nameStage
    def hostname

            if ( isChangeSet() ) {
                stage('Deploy to Production') {
                        nameStage = "app-prod"
                        namespace = "prod"
                        tagDockerImage = "${sh(script:'cat production-release.txt',returnStdout: true)}"
                        hostname = "prod-184-173-46-252.nip.io"
                            deploy( nameStage, namespace, tagDockerImage, hostname  )
                }
            }
            else if ( isMaster() ) {
               stage('Deploy dev version') {
                    nameStage = "app-dev"
                    namespace = "dev"
                    tagDockerImage = env.BRANCH_NAME
                    hostname = "dev-184-173-46-252.nip.io"
                        deploy( nameStage, namespace, tagDockerImage, hostname )
               }
            }
            
            else if ( isBuildingTag() ) {
                stage('Deploy to QA stage') {
                    nameStage = "app-qa"
                    namespace = "qa"
                    tagDockerImage = env.BRANCH_NAME
                    hostname = "qa-184-173-46-252.nip.io"
                        deploy( nameStage, namespace, tagDockerImage, hostname )
                    }
                }   
            
    }
}    
    boolean isPullRequest() {
      return (env.BRANCH_NAME ==~  /^PR-\d+$/)
    }
    boolean isMaster() {
      return (env.BRANCH_NAME == "master" )
    }
    boolean isBuildingTag() {
      return ( env.BRANCH_NAME ==~ /^v\d.\d.\d$/ || env.BRANCH_NAME ==~ /^\d.\d.\d$/)
    }

    boolean isPushToAnotherBranch() {
      return ( ! isMaster() && ! isBuildingTag() && ! isPullRequest() )
    }
    
    boolean isChangeSet() {


      // new version
        currentBuild.changeSets.any { changeSet -> 
          changeSet.items.any { entry -> 
            entry.affectedFiles.any { file -> 
              if (file.path.equals("production-release.txt")) {
                return true
              }
            }
          }
        }

      // one more try 
      // currentBuild.changeSets*.items*.affectedFiles.find { it.path.equals("production-release.txt") }

     // previous version
      // def changeLogSets = currentBuild.changeSets
      // for (int i = 0; i < changeLogSets.size(); i++) {
      //   def entries = changeLogSets[i].items
      //   for (int j = 0; j < entries.length; j++) {   
      //     def files = new ArrayList(entries[j].affectedFiles)
      //     for (int k = 0; k < files.size(); k++) {
      //         def file = files[k]
      //         if (file.path.equals("production-release.txt")) {
      //             return true
      //         }
      //     }
      //   }
      // }

  }
    def deploy( appName, namespace, tagName, hostName ) {
        container('helm') {
          echo "Release image: ${DOCKERHUB_IMAGE}:$tagName"
          echo "Deploy app name: $appName"
        withKubeConfig([credentialsId: 'kubeconfig']) {
          sh """
         helm upgrade --install $appName --debug --force ./app \
            --namespace=$namespace \
            --set image.tag="$tagName" \
            --set ingress.hostName=$hostName \
            --set-string ingress.tls[0].hosts[0]="$hostName" \
            --set-string ingress.tls[0].secretName=acme-$appName-tls 
          """
        }
        }
    }