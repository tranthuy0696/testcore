pipeline {
	agent none
  environment {
    GROUP = "core"
    CENTRAL_NEXUS = "192.168.88.33:8083"
  }
	stages {
		stage('Build') {
			agent {
				docker {
				  image 'node:latest'
 					args '-v addDhcp:$WORKSPACE/node_modules'
				}
			}
			steps {
				echo "Branch is ${env.BRANCH_NAME}..."
				echo "Update module version"
        sh 'chmod +x script.sh'
				sh 'chmod +x test.sh'
				echo "toke ${env.npm_auth_token}"
				sh("""
						echo '' >> .npmrc
						echo "_auth=${env.npm_auth_token}" >> .npmrc
					""")
				// echo '' >> .npmrc
				// echo "_auth=${env.npm_auth_token}" > .npmrc
				// echo "" >> .npmrc
				// echo "_auth=${env.npm_auth_token}" > .npmrc
				script {
		      RESULT = sh(returnStdout: true, script: "./script.sh '${env.BUILD_NUMBER}'").trim().split(' ')
		      MODULE = "${RESULT[0]}"
          FILENAME = "${MODULE}.tar.gz"
          VERSION = "${RESULT[1]}"
					RESULT1 = sh(returnStdout: true, script: "./test.sh '${env.BUILD_NUMBER}'").trim().split(' ')
        }
				echo "Result ${RESULT1}"
        echo "Performing npm build..."
					sh 'npm set registry http://192.168.88.33:8083/repository/npm-group/'
          sh 'npm install'
					sh 'cd client && npm install && echo $PWD && npm run build && cd ../ && npm run build'

          stash includes: 'dist/**/*', name: 'dist'
					sh 'npm set registry http://192.168.88.33:8083/repository/private-npm/'
					sh 'npm publish'
					sh "tar -cvzf ${FILENAME} -C dist ."
					nexusArtifactUploader(
							nexusVersion: 'nexus3',
							protocol: 'http',
							nexusUrl: "${CENTRAL_NEXUS}",
							groupId: "com.pcn.${GROUP}",
							version: "${VERSION}",
							repository: 'private-raw',
							credentialsId: 'nexus-credentials',
							artifacts: [
									[artifactId: "${MODULE}",
									classifier: '',
									file: "${FILENAME}",
									type: 'tar.gz']
							]
					)
			}
		}
  }
}
