'use strict'
const chai = require("chai")
const sinon = require("sinon")
const fileSystem = require("../../file-system")

process.env.npm_lifecycle_event = "file-system"
const app = require("../../app")

const assert = chai.assert
sinon.assert.expose(assert, { prefix: '' })

chai.use(require("chai-http"))

afterEach(() => sinon.restore())

describe("app", () => {
  describe('GET /api/todos', () => {
    describe('completedが指定されていない場合', () => {
      it('fetchAll()で取得したToDoの配列を返す', async () => {
        const todos = [
          { id: "a", title: "ネーム", completed: false },
          { id: "b", title: "下書き", completed: true }
        ]
        sinon.stub(fileSystem, "fetchAll").resolves(todos)

        const res = await chai.request(app).get("/api/todos")

        assert.strictEqual(res.status, 200)
        assert.deepEqual(res.body, todos)
      })
      it("fetchAllが失敗したらエラーを返す", async () => {
        sinon.stub(fileSystem, "fetchAll")
          .rejects(new Error("fetchAll()失敗"))

        const res = await chai.request(app).get('/api/todos')

        assert.strictEqual(res.status, 500)
        assert.deepEqual(res.body, { error: "fetchAll()失敗" })
      })
    })
    describe('completedが指定されている場合', () => {
      it(
        "completedを引数にfetchByCompleted()を実行し取得したToDoの配列を返す",
        async () => {
          const todos = [
            { id: "a", title: "ネーム", completed: false },
            { id: "b", title: "下書き", completed: true },
          ]
          sinon.stub(fileSystem, "fetchByCompleted").resolves(todos)

          for ( const completed of [true, false]) {
            const res = await chai.request(app)
              .get('/api/todos')
              .query({ completed })

            assert.strictEqual(res.status, 200)
            assert.deepEqual(res.body, todos)
            assert.calledWith(fileSystem.fetchByCompleted, completed)
          }
        }
      )
      it('fetchByCompleted()が失敗したらエラーを返す', async () => {
        sinon.stub(fileSystem, "fetchByCompleted")
          .rejects(new Error('fetchByCompleted()失敗'))

        const res = await chai.request(app)
          .get('/api/todos')
          .query({ completed: true })

        assert.strictEqual(res.status, 500)
        assert.deepEqual(res.body, { error: 'fetchByCompleted()失敗'})
      })
    })
  })
  describe('POST /api/todos', () => {
    it(
      'パラメータで指定したタイトルを引数にcreate()を実行し、結果を返す',
      async () => {
        sinon.stub(fileSystem, "create").resolves()

        const res = await chai.request(app)
          .post('/api/todos')
          .send({ title: "ネーム" })

        assert.strictEqual(res.status, 201)
        assert.strictEqual(res.body.title, "ネーム")
        assert.strictEqual(res.body.completed, false)
        assert.calledWith(fileSystem.create, res.body)
      }
    )
    it(
      'パラメータにタイトルが指定されていない場合、400エラーを返す',
      async () => {
        sinon.spy(fileSystem, "create")

        for ( const title of ["", undefined]) {
          const res = await chai.request(app)
            .post('/api/todos')
            .send({ title })

          assert.strictEqual(res.status, 400)
          assert.deepEqual(res.body, { error: "title is required" })

          assert.notCalled(fileSystem.create)
        }
      }
    )
    it(
      'create()が失敗したらエラーを返す',
      async () => {
        sinon.stub(fileSystem, "create").rejects(new Error('create()失敗'))

        const res = await chai.request(app)
          .post('/api/todos')
          .send({ title: "ネーム" })

          assert.strictEqual(res.status, 500)
          assert.deepEqual(res.body, { error: "create()失敗" })
      }
    )
  })
  describe('PUT /api/todos/:id/completed', () => {
    it(
      'パスで指定したIDのToDoのcompletedをtrueに設定し、更新後のToDoを返す',
      async () => {
        const todo = { id: 'a', title: 'ネーム', completed: true }
        // スタブの生成
        sinon.stub(fileSystem, 'update').resolves(todo)

        // リクエストの送信
        const res = await chai.request(app).put('/api/todos/a/completed')

        // レスポンスのアサーション
        assert.strictEqual(res.status, 200)
        assert.deepEqual(res.body, todo)
        // update()の引数のアサーション
        assert.calledWith(fileSystem.update, 'a', { completed: true })
      }
    )
    it('update()がnullを返したら404エラーを返す', async () => {
      // スタブの生成
      sinon.stub(fileSystem, 'update').resolves(null)

      // リクエストの送信
      const res = await chai.request(app).put('/api/todos/a/completed')

      // レスポンスのアサーション
      assert.strictEqual(res.status, 404)
      assert.deepEqual(res.body, { error: 'ToDo not found' })
    })
    it('update()が失敗したらエラーを返す', async () => {
      // スタブの生成
      sinon.stub(fileSystem, 'update').rejects(new Error('update()失敗'))

      // リクエストの送信
      const res = await chai.request(app).put('/api/todos/a/completed')

      // レスポンスのアサーション
      assert.strictEqual(res.status, 500)
      assert.deepEqual(res.body, { error: 'update()失敗' })
    })
  })
  describe('DELETE /api/todos/:id/completed', () => {
    it(
      'パスで指定したIDのToDoのcompletedをfalseに設定し、更新後のToDoを返す',
      async () => {
        const todo = { id: 'a', title: 'ネーム', completed: false }
        // スタブの生成
        sinon.stub(fileSystem, 'update').resolves(todo)

        // リクエストの送信
        const res = await chai.request(app).delete('/api/todos/a/completed')

        // レスポンスのアサーション
        assert.strictEqual(res.status, 200)
        assert.deepEqual(res.body, todo)
        // update()の引数のアサーション
        assert.calledWith(fileSystem.update, 'a', { completed: false })
      }
    )
    it('update()がnullを返したら404エラーを返す', async () => {
      // スタブの生成
      sinon.stub(fileSystem, 'update').resolves(null)

      // リクエストの送信
      const res = await chai.request(app).delete('/api/todos/a/completed')

      // レスポンスのアサーション
      assert.strictEqual(res.status, 404)
      assert.deepEqual(res.body, { error: 'ToDo not found' })
    })
    it('update()が失敗したらエラーを返す', async () => {
      // スタブの生成
      sinon.stub(fileSystem, 'update').rejects(new Error('update()失敗'))

      // リクエストの送信
      const res = await chai.request(app).delete('/api/todos/a/completed')

      // レスポンスのアサーション
      assert.strictEqual(res.status, 500)
      assert.deepEqual(res.body, { error: 'update()失敗' })
    })
  })
  describe('DELETE /api/todos/:id', () => {
    it('パスで指定したIDのToDoを削除する', async () => {
      // スタブの生成
      sinon.stub(fileSystem, 'remove').resolves('a')

      // リクエストの送信
      const res = await chai.request(app).delete('/api/todos/a')

      // レスポンスのアサーション
      assert.strictEqual(res.status, 204)
      assert.deepEqual(res.body, {})
      // remove()の引数のアサーション
      assert.calledWith(fileSystem.remove, 'a')
    })
    it('remove()がnullを返したら404エラーを返す', async () => {
      // スタブの生成
      sinon.stub(fileSystem, 'remove').resolves(null)

      // リクエストの送信
      const res = await chai.request(app).delete('/api/todos/a')

      // レスポンスのアサーション
      assert.strictEqual(res.status, 404)
      assert.deepEqual(res.body, { error: 'ToDo not found' })
    })
    it('remove()が失敗したらエラーを返す', async () => {
      // スタブの生成
      sinon.stub(fileSystem, 'remove').rejects(new Error('remove()失敗'))

      // リクエストの送信
      const res = await chai.request(app).delete('/api/todos/a')

      // レスポンスのアサーション
      assert.strictEqual(res.status, 500)
      assert.deepEqual(res.body, { error: 'remove()失敗' })
    })
  })
})
